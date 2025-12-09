const supabase = require('../../config/supabaseClient.js')

// We don't need a connect function as the Supabase client handles it,
// but we can create a function to verify the connection on startup.
async function checkSupabaseConnection() {
    try {
        // A simple query to check the connection works
        const { error } = await supabase.from('group_settings').select('group_id').limit(1)
        if (error) throw error
        console.log("✅ Connected to Supabase")
    } catch (error) {
        console.error("❌ Error connecting to Supabase:", error.message)
        console.error("Please ensure your Supabase credentials in the .env file are correct and the tables are set up.")
        // Exit the process if the bot cannot connect to the database
        process.exit(1)
    }
}

async function getGroupSettings(groupId) {
    const { data, error } = await supabase
        .from('group_settings')
        .select('*')
        .eq('group_id', groupId)
        .single()

    if (error && error.code === 'PGRST116') { // PGRST116 means "The result contains 0 rows"
        // No settings found for this group, so create default ones and return them
        const { data: newData, error: insertError } = await supabase
            .from('group_settings')
            .insert({ group_id: groupId, anti_link: true, anti_bad_word: true, warn_limit: 3 })
            .select()
            .single()

        if (insertError) {
            console.error("Error creating group settings:", insertError)
            return { groupId, anti_link: true, anti_bad_word: true, warn_limit: 3 } // return default on error
        }
        return newData
    } else if (error) {
        console.error("Error fetching group settings:", error)
        return null
    }

    return data
}

async function addWarning(groupId, userId) {
    // This is an "upsert" operation. We want to insert a new row or increment the existing one.
    // The RPC function 'add_warning' we created in Supabase is perfect for this.
    const { data, error } = await supabase.rpc('add_warning', {
        p_group_id: groupId,
        p_user_id: userId
    })

    if (error) {
        console.error("Error adding warning:", error)
        return null
    }

    return data // The RPC function returns the new warning count
}

async function resetWarnings(groupId, userId) {
    const { error } = await supabase
        .from('warnings')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error("Error resetting warnings:", error)
    }
}

module.exports = { checkSupabaseConnection, getGroupSettings, addWarning, resetWarnings }