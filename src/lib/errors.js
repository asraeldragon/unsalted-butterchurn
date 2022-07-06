export const showError = text => {
  console.error(text)
  const error = document.getElementById('error')
  error.innerText = text

  document.getElementById('clickHere').style.display = 'none'
}

export const errorToMessage = err => `${err.name}: ${err.message}`
