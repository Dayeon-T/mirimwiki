import { createClient_ as supabase } from '../supabaseClient'

export async function signUp(email, password, name, birth) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nickname: name,
                birth
            }
        }
    })
    return {data, error}
}

export async function signIn(email, password) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
    })
    return {data, error}
}