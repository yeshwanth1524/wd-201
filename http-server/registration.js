const form = document.querySelector('#registration-form');
const table = document.querySelector('#user-table tbody');

// Load user data from local storage and display it
const loadUserData = () => {
  // Clearing the table
  table.innerHTML = '';

  if (localStorage.getItem('users')) {
    const users = JSON.parse(localStorage.getItem('users'));
    users.forEach(user => {
      const newRow = table.insertRow();
      const nameCell = newRow.insertCell();
      const emailCell = newRow.insertCell();
      const passwordCell = newRow.insertCell();
      const dobCell = newRow.insertCell();
      const acceptedTermsCell = newRow.insertCell();

      nameCell.innerText = user.name;
      emailCell.innerText = user.email;
      passwordCell.innerText = user.password;
      dobCell.innerText = new Date(user.dob).toISOString().slice(0,10);
      acceptedTermsCell.innerText = user.acceptedTerms ? 'true' : 'false';
    });
  }
};

loadUserData();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const dobInput = document.querySelector('#dob');
  const dob = document.getElementById('dob').value;
  const acceptedTerms = document.querySelector('#checkbox').checked;

  const date = new Date(dob);
  const nxtdate = new Date();
  const maxidate = (new Date(nxtdate.getFullYear() - 55, nxtdate.getMonth(), nxtdate.getDate()))
  const minidate = (new Date(nxtdate.getFullYear() - 18, nxtdate.getMonth(), nxtdate.getDate()));

  if (date < maxidate || date > minidate) {
        alert('Enter a valid date of birth- between 18 and 55 years ago.');
        return;
    }

  // Create a user object with the form data
  const user = {
    name: name,
    email: email,
    password: password,
    dob: dob,
    acceptedTerms: acceptedTerms
  };

  // Get existing users from local storage or initialize an empty array
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Add the new user to the array
  users.push(user);

  // Save the updated array back to local storage
  localStorage.setItem('users', JSON.stringify(users));

  // Add the new row to the table
  const newRow = table.insertRow();
  const nameCell = newRow.insertCell();
  const emailCell = newRow.insertCell();
  const passwordCell = newRow.insertCell();
  const dobCell = newRow.insertCell();
  const acceptedTermsCell = newRow.insertCell();

  nameCell.innerText = name;
  emailCell.innerText = email;
  passwordCell.innerText = password;
  dobCell.innerText = new Date(user.dob).toISOString().slice(0,10);
  acceptedTermsCell.innerText = acceptedTerms ? 'true' : 'false';

  // Reset the form
  // form.reset();

  // Load and display the updated user data
  loadUserData();
});

// Clear the table and local storage when the form is reset
form.addEventListener('reset', () => {
  table.innerHTML = '';
});