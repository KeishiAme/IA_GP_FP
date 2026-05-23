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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/
    return regex.test(password)
}

async function signUpUser() {
    if (!validateAppKey()) return

    const firstName = document.getElementById('signupFirstName').value.trim()
    const lastName = document.getElementById('signupLastName').value.trim()
    const email = document.getElementById('signupEmail').value.trim()
    const password = document.getElementById('signupPassword').value
    const phone = document.getElementById('signupPhone').value.trim()

    if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all required fields.')
        return
    }

    if (!validatePassword(password)) {
        document.getElementById('passwordError').innerText =
            'Password must contain uppercase, lowercase, number, special character, and minimum 12 characters.'
        return
    }

    document.getElementById('passwordError').innerText = ''

    const { data, error } = await _supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo:
                'https://keishiame.github.io/IA_GP_FP/front/login.html',
            data: {
                first_name: firstName,
                last_name: lastName,
                phone
            }
        }
    })

    if (error) {
        alert('Error: ' + error.message)
    } else {
        alert('Success! Check your email for the confirmation link.')
        console.log('User created:', data)
    }
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function getLockoutData() {
    const raw = localStorage.getItem('loginLockout')
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null }
}

function saveLockoutData(data) {
    localStorage.setItem('loginLockout', JSON.stringify(data))
}

function showError(msg) {
    if (typeof showBannerError === 'function') {
        showBannerError(msg)
    } else {
        alert(msg)
    }
}

async function loginUser() {
    if (typeof clearErrors === 'function') clearErrors()

    const lockout = getLockoutData()

    if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
        const mins = Math.ceil((lockout.lockedUntil - Date.now()) / 60000)
        showError('Too many failed attempts. Try again in ' + mins + ' minute(s).')
        return
    }

    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value

    let valid = true

    if (!email) {
        if (typeof setFieldError === 'function') {
            setFieldError('emailError', 'Email is required.')
        } else {
            document.getElementById('loginEmail').classList.add('error-field')
        }
        valid = false
    }

    if (!password) {
        if (typeof setFieldError === 'function') {
            setFieldError('passwordError', 'Password is required.')
        } else {
            document.getElementById('loginPassword').classList.add('error-field')
        }
        valid = false
    }

    if (!valid) return

    if (typeof setLoading === 'function') setLoading(true)

    const rememberMe = document.getElementById('rememberMe')?.checked ?? true

    const { data, error } = await _supabase.auth.signInWithPassword({
        email,
        password,
        options: {
            persistSession: rememberMe
        }
    })

    if (typeof setLoading === 'function') setLoading(false)

    if (error) {
        lockout.attempts = (lockout.attempts || 0) + 1

        if (lockout.attempts >= MAX_ATTEMPTS) {
            lockout.lockedUntil = Date.now() + LOCKOUT_MS
            saveLockoutData(lockout)
            showError('Too many failed attempts. Account locked for 15 minutes.')
        } else {
            saveLockoutData(lockout)
            const remaining = MAX_ATTEMPTS - lockout.attempts
            showError(error.message + ' — ' + remaining + ' attempt(s) remaining.')
        }
    } else {
        saveLockoutData({ attempts: 0, lockedUntil: null })
        window.location.href = 'dashboard.html'
    }
}

async function loginWithGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://keishiame.github.io/IA_GP_FP/front/dashboard.html'
        }
    })

    if (error) {
        alert('Error with Google Login: ' + error.message)
    }
}

_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        const currentPage = window.location.pathname.split('/').pop()
        const authPages = ['login.html', 'signup.html', 'index.html', '']

        if (authPages.includes(currentPage)) {
            window.location.href = 'dashboard.html'
        }
    }
})

async function logout() {
    await _supabase.auth.signOut()
    window.location.href = 'login.html'
}

async function resetPassword() {
    const email = document.getElementById('resetEmail').value.trim()

    if (!email) {
        alert('Please enter your email address.')
        return
    }

    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/index.html'
    })

    if (error) {
        alert('Error: ' + error.message)
    } else {
        alert('Password reset email sent! Check your inbox.')
    }
}

async function confirmOtp() {
    const phone = document.getElementById('otpPhone').value.trim()
    const token = document.getElementById('otpCode').value.trim()

    if (!phone || !token) {
        alert('Please enter your phone number and the verification code.')
        return
    }

    const { data, error } = await _supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
    })

    if (error) {
        alert('Verification failed: ' + error.message)
    } else {
        alert('Phone verified successfully!')
        window.location.href = 'login.html?verified=true'
    }
}
