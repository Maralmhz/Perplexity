// ============================================
// SUPABASE CONFIG
// ============================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://hefpzigrxyyhvtgkyspr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Af0DdLvEB9NuDE69aIPr_w_3a55KPLk'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ============================================
// LOGIN FORM HANDLER
// ============================================
const loginForm = document.getElementById('loginForm')
const btnText = document.getElementById('btnText')
const btnLoader = document.getElementById('btnLoader')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const remember = document.getElementById('remember').checked

  if (!email || !password) {
    showError('Preencha todos os campos!')
    return
  }

  // Loading
  btnText.style.display = 'none'
  btnLoader.style.display = 'inline-block'
  loginForm.querySelector('.btn-login').disabled = true

  // Login real via Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    showError('E-mail ou senha incorretos!')
    btnText.style.display = 'inline'
    btnLoader.style.display = 'none'
    loginForm.querySelector('.btn-login').disabled = false
    return
  }

  // Buscar dados do usuário
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, oficinas(*)')
    .eq('id', data.user.id)
    .single()

  // Salvar sessão
  const sessionData = {
    id: data.user.id,
    email: data.user.email,
    nome: usuario?.nome || email.split('@')[0],
    role: usuario?.role || 'user',
    oficina_id: usuario?.oficina_id,
    oficina: usuario?.oficinas,
    loginTime: new Date().toISOString()
  }

  if (remember) {
    localStorage.setItem('checkauto_user', JSON.stringify(sessionData))
  } else {
    sessionStorage.setItem('checkauto_user', JSON.stringify(sessionData))
  }

  // Redirecionar
  if (usuario?.role === 'superadmin') {
    window.location.href = 'admin.html'
  } else {
    window.location.href = 'index.html'
  }
})

// ============================================
// TOGGLE PASSWORD
// ============================================
function togglePassword() {
  const passwordInput = document.getElementById('password')
  const eyeIcon = document.getElementById('eyeIcon')
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text'
    eyeIcon.classList.replace('fa-eye', 'fa-eye-slash')
  } else {
    passwordInput.type = 'password'
    eyeIcon.classList.replace('fa-eye-slash', 'fa-eye')
  }
}

// ============================================
// ERROR MESSAGE
// ============================================
function showError(message) {
  alert(message)
}

// ============================================
// CHECK SE JÁ ESTÁ LOGADO
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    window.location.href = 'index.html'
  }
  console.log('🔐 CheckAuto Login — Supabase Auth')
})

// ============================================
// FORGOT PASSWORD
// ============================================
document.querySelector('.forgot-password').addEventListener('click', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  if (!email) {
    showError('Digite seu e-mail primeiro!')
    return
  }
  await supabase.auth.resetPasswordForEmail(email)
  alert('✅ E-mail de recuperação enviado!')
})
