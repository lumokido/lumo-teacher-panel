const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      emailId: 'admin@test.com',
      password: 'password'
    });
    const token = loginRes.data.token || loginRes.data;
    
    const res = await axios.get('http://localhost:8080/api/gallery', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(res.data).substring(0, 500));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
