const form = document.getElementById("signupForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const error = document.getElementById("error");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (password.value !== confirmPassword.value) {
    error.textContent = "Passwords do not match!";
    successMessage.textContent = "";
  } else if (password.value.length < 6) {
    error.textContent = "Password must be at least 6 characters long!";
    successMessage.textContent = "";
  } else {
    error.textContent = "";
    successMessage.textContent = "Signup successful! 🎉";
    form.reset();
  }
});
