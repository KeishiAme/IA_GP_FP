const supabaseUrl = 'https://fvpwikjfujmtzyfcdejy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cHdpa2pmdWptdHp5ZmNkZWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODYyODgsImV4cCI6MjA5MjA2MjI4OH0.iMwMxw0bidkBeYVylEGnfw8TnTPe38p_pBamDlBHVBI'
const _supabase = supabase.createClient(supabaseUrl, supabaseKey)
const VALID_APP_KEY = "CSCN08C-SECURE-2026"

function validateAppKey() {
    const userEnteredKey = document.getElementById('appKeyInput').value
    if (userEnteredKey === VALID_APP_KEY) {
        return true
    } else {
        alert("Invalid AppKey! You are not authorized to use this system.")
        return false
    }
}

function validatePassword(password) {
    const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

    return regex.test(password);
}

async function signUpUser() {
    if (!validateAppKey()) return; 
    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    
    if (!email || !password) {
        alert("Please fill in all fields")
        return
    }
    
    if (!validatePassword(password)) {
    document.getElementById("passwordError").innerText =
    "Password must contain uppercase, lowercase, number, special character, and minimum 12 characters.";

    return;
    }
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    })

    if (error) {
        alert("Error: " + error.message)
    } else {
        alert("Success! Check your email for the confirmation link.")
        console.log("User created:", data)
    }
}
let loginAttempts = 0;

async function loginUser() {
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })
    loginAttempts++;

    if (loginAttempts > 5) {
        alert("Too many login attempts.");
        return;
    }
    if (error) {
        alert("Login failed: " + error.message)
    } else {
        alert("Login successful!")
        window.location.replace("dashboard.html");
    }
}

async function loginWithGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
    })
    if (error) alert("Error with Google Login: " + error.message)
}
async function logout() {
    await _supabase.auth.signOut();
    window.location.replace("login.html");
}
