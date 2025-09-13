require('dotenv').config();
const supabase = require('./supabase');

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test basic connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Connection error:', error);
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('Response:', data);
        }
        
        // Test insert (this will fail if RLS is enabled)
        console.log('\nTesting insert...');
        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{
                parent_name: 'Test User',
                email: 'test-connection@example.com',
                password_hash: 'test123'
            }])
            .select();
        
        if (insertError) {
            console.error('❌ Insert error:', insertError);
        } else {
            console.log('✅ Insert successful!');
            console.log('Inserted:', insertData);
            
            // Clean up test data
            await supabase
                .from('users')
                .delete()
                .eq('email', 'test-connection@example.com');
            console.log('🧹 Test data cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testConnection();