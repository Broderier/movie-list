const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // paginator 的 li 要等於頁數
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 分頁器: 回傳每頁的電影資料
function getMoviesByPage(page) {
  // page 1 -> movie[0] ~ movie[11]
  // page 2 -> movie[12] ~ movie[23]
  // page 3 -> movie[24] ~ movie[35]
  // ...
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// 收藏電影
function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }
  //console.log(id)
  // localStorage.get()回傳的是字串，用JSON.parse()將其變成 JS 的資料(物件/陣列格式)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // const movie = movies.find(isMovieIdMatched)
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('This movie has been added to My Favorite!')
  }
  list.push(movie)
  // 將 JS 資料轉換成字串，存入 favoriteMovies 裡
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// processing: render the content of modals
// step1: add event listener: 按下 More 時自動將 Modal 內容改成對應的電影內容
// 不用匿名函式原因在於利於 debug
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // dataset(data-bs-target, data-id, data-bs-toggle 等等有prefix data- 的屬性) 的值都是字串
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    // 加入收藏清單
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 按下分頁器顯示各頁面
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果點擊的 target 不是 <a> 標籤的話即中止函式
  if (event.target.tagName !== 'A') return
  // console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))

})

// add search function
// 按下 submit 後抓到包含關鍵字的電影，並重新 render 頁面
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // submit 的預設值是重整頁面。預防預設值發生並把控制權交給 JavaScript來掌控 UI 行為。
  event.preventDefault()
  // trim() 將前後的空白去除， toLowerCase()將字串全部變成小寫，預防大小寫之分而找不到關鍵字的問題
  const keyword = searchInput.value.trim().toLowerCase()
  let filteredMovies = []

  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  // 用迴圈篩選
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  renderMovieList(filteredMovies)

  // keyword.length = 0 亦即 boolean 的 0 (False)， !false = true 即可觸發 alert
  // if(!keyword.length) {
  //   return alert('Please enter a valid string')
  // }
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    movies.push(...response.data.results)
    // renderMovieList(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

//localStorage.setItem('default_language', 'English')
// console.log(localStorage.getItem('default_language'))
// localStorage.removeItem('default_language')
// console.log(localStorage.getItem('default_language'))
