const supabaseUrl = 'https://fvpwikjfujmtzyfcdejy.supabase.co'
    await _supabase.auth.signOut()
    window.location.href = 'login.html'
}

async function resetPassword() {

    const email = document.getElementById('resetEmail').value.trim()

    if (!email) {
        alert('Please enter your email.')
        return
    }

    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://keishiame.github.io/IA_GP_FP/front/login.html'
    })

    if (error) {
        alert(error.message)
    } else {
        alert('Password reset email sent!')
    }
}

async function confirmOtp() {

    const phone = document.getElementById('otpPhone').value.trim()
    const token = document.getElementById('otpCode').value.trim()

    const { error } = await _supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
    })

    if (error) {
        alert('Invalid OTP: ' + error.message)
        return
    }

    alert('Phone verified successfully!')
    window.location.href = 'login.html'
}

function togglePassword(inputId, toggleElement) {

    const input = document.getElementById(inputId)

    if (input.type === 'password') {
        input.type = 'text'
        toggleElement.innerText = '🙈'
    } else {
        input.type = 'password'
        toggleElement.innerText = '👁️'
    }
}
