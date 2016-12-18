import template from './menu.hbs'
import { EventEmitter } from 'events'
import './menu.scss'

const levels = ['1']

export default class Menu extends EventEmitter {

  constructor () {
    super()

    this.element = document.createElement('div')

    this.element.innerHTML = template()

    this.showView('main')

    const newGame = this.element.querySelector('[name="newGame"]')

    newGame.addEventListener('click', e => {
      e.preventDefault()
      this.showView('level-select')
    })
  }

  showView (view) {
    [...this.element.querySelectorAll('[data-view]')].forEach(e => e.classList.add('hidden'))

    this.element.querySelector(`[data-view="${view}"]`).classList.remove('hidden')

    if (view === 'level-select') {
      this.populateLevelSelect();
    }
  }

  populateLevelSelect () {
    const container = this.element.querySelector('[name="levelList"]')
    levels.forEach(level => {
      const link = document.createElement('a')
      link.innerText = level
      link.href = '#'

      link.addEventListener('click', () => {
        this.selectLevel(level)
      })

      container.appendChild(link)
    })
  }

  selectLevel (level) {
    this.emit('select-level', level)
  }
}
