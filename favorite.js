const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''

  // processing: render the movie list
  data.forEach((item) => {
    // we need title and image
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}">
            <div class="card-body">
              <h5 class="card-title">"${item.title}"</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// 渲染 modal 內容
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie poster" class="img-fluid">`
  })
}

function removeFromFavorite(id) {
  // 若收藏清單是空的即結束函式
  if (!movies || !movies.length)
    return
  // 刪除時需要目標 movie 在 movies 裡的 Index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // 若傳入的 id 無法在收藏清單內找到即結束函式
  if (movieIndex === -1)
    return

  movies.splice(movieIndex, 1)
  // // 將 JS 資料轉換成字串，存入 favoriteMovies 裡
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 按下 X 後即時讓被刪除的 movie 從畫面上消失 (再次渲染)
  renderMovieList(movies)
}



// processing: render the content of modals
// step1: add event listener: 按下 More 時自動將 Modal 內容改成對應的電影內容
// 不用匿名函式原因在於利於 debug
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // dataset(data-bs-target, data-id, data-bs-toggle 等等有prefix data- 的屬性) 的值都是字串
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    // 加入收藏清單
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)

//localStorage.setItem('default_language', 'English')
// console.log(localStorage.getItem('default_language'))
// localStorage.removeItem('default_language')
// console.log(localStorage.getItem('default_language'))
