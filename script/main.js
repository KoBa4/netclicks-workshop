const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2"
const SERVER = 'https://api.themoviedb.org/3'
const API_KEY = 'a7c0da5a5b305f2e8011e35c50f18fab'

const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    dropdowns = document.querySelectorAll('.dropdown'),
    preLoader = document.querySelector('.preloader');

const loading = document.createElement('div')
loading.className = 'loading'

class DBService {
    #server = 'https://api.themoviedb.org/3'
    #api_key = 'a7c0da5a5b305f2e8011e35c50f18fab'

    getData = async (url) => {
        const res = await fetch(url)
        if (res.ok) {
            return res.json()
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }

    // getTestData = () => this.getData('test.json')
    // getTestCard = () => this.getData('card.json')

    getSearchResult = query => this.getData(
        // SERVER + '/search/tv?api_key=' + API_KEY + '&language=ru-RU&query=' + query
        `${this.#server}/search/tv?api_key=${this.#api_key}&language=ru-RU&query=${query}`
    )

    getTvShow = id => this.getData(
        `${this.#server}/tv/${id}?api_key=${this.#api_key}&language=ru-RU`
    )
}

const renderCard = response => {
    tvShowsList.textContent = ''

    if (response.total_results === 0) {
        const notFoundImg = document.createElement('img')
        notFoundImg.src = 'img/not-found.png'
        notFoundImg.style.gridColumn = '2/4'
        loading.remove()
        tvShowsList.append(notFoundImg)
    }

    response.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            poster_path: poster,
            name: title,
            vote_average: vote,
            id
        } = item
        const posterImg = poster ? IMG_URL + poster : 'img/no-poster.jpg'
        const backdropImg = backdrop ? IMG_URL + backdrop : ''
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''

        const card = document.createElement('li')
        card.classList.add('tv-shows__item')
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                     src="${posterImg}"
                     data-backdrop="${backdropImg}"
                     alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `
        loading.remove()
        tvShowsList.append(card)
    })
}

searchForm.addEventListener('submit', event => {
    event.preventDefault()
    const value = searchFormInput.value.trim()
    searchFormInput.value = ''
    if (value) {
        tvShows.append(loading)
        new DBService().getSearchResult(value).then(renderCard)
    }
})

// Меню
const closeDropdown = () => {
    dropdowns.forEach(item => {
        item.classList.remove('active')
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu')
    hamburger.classList.toggle('open')
    closeDropdown()
})

document.addEventListener('click', event => {
    const target = event.target
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
        closeDropdown()
    }
})

leftMenu.addEventListener('click', event => {
    event.preventDefault()
    const target = event.target
    const dropdown = target.closest('.dropdown')
    if (dropdown) {
        dropdown.classList.toggle('active')
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')
    }
})

// Модалиное окно
tvShowsList.addEventListener('click', event => {
    event.preventDefault()

    const target = event.target
    const card = target.closest('.tv-card')

    if (card) {
        preLoader.style.display = 'block'
        new DBService().getTvShow(card.id)
            .then(({
               poster_path: poster,
               name: title,
               genres,
               vote_average: vote,
               overview,
               homepage}) => {
                tvCardImg.src = poster ? IMG_URL + poster : 'img/no-poster.jpg'
                tvCardImg.alt = title
                modalTitle.textContent = title
                genresList.innerHTML = genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '')
                rating.textContent = vote
                description.textContent = overview
                modalLink.href = homepage
            })
            .then(() => {
                preLoader.style.display = 'none'
                document.body.style.overflow = 'hidden'
                modal.classList.remove('hide')
            })
    }
})

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = ''
        modal.classList.add('hide')
    }
})

// Смена карточки
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item')

    if (card) {
        const img = card.querySelector('.tv-card__img')
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }
    }
}

tvShowsList.addEventListener('mouseover', changeImage)
tvShowsList.addEventListener("mouseout", changeImage);