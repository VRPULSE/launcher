document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // 사용자 입력 데이터 전달
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Login successful!');
        console.log('Token:', data.token); // JWT 토큰 확인
        localStorage.setItem('token', data.token); // 토큰을 로컬 스토리지에 저장 (옵션)
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });

  // script.js
document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const icon = this;
  
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.src = 'image/eye_icon.svg'; // 비밀번호 숨김 아이콘
    } else {
      passwordInput.type = 'password';
      icon.src = 'image/eye_cross_icon.svg'; // 비밀번호 표시 아이콘
    }
  });