import gameCanvas from '../models/gameCanvas'
import dataController from './dataController'
import D from '../models/debugLog'

var stateManager = (function () {
  const initialState = {
    content: 'startScreen', // 'main', 'credits', 'controlls'
    view: 'menu', // 'menu', 'driver', 'story'
    status: {
      content: 'startScreen',
      view: 'menu',
      atmoPath: ''
    },
    chapter: 0,
    scene: 0,
    language: 'eng', // 'hun', 'eng'
    transitionSound: null,
    items: {
      a1  : false,
      a2  : false,
      a3  : false,
      a4  : false,
      b1  : false,
      b2  : false,
      b3  : false,
      b4  : false,
      c1  : false,
      c2  : false,
      c3  : false,
      d1  : false,
      d2  : false,
      d3  : false,
    },
    volume: 1,
    init: true,
    debugMode: true
  }

  var state = []

  //
  /**
   * Load state from the local storage. if its not possible make a new based on the initialState.
   * @return {Object} State
   */
  var loadState = function () {
    try {
      state = dataController.loadState()
      var i
      if (!!state) {
        for (i in initialState) {
          if (!state.hasOwnProperty(i)) {
            state[i] = initialState[i]
          }
        }
        return state
      } else {
        console.warn('There is no state in the local storage!')
        return initialState
      }
    } catch (error) {
      console.warn('inner load state fail')
      console.error(error + ' There is no state in the local storage!')
      return initialState
    }
  }

  return {
    loadState: () => {
      return loadState()
    },
    setContent: content => {
      state = loadState()
      var oldContent = state.content
      state.content = content
      if (state.view !== 'menu') state.status.content = content
      dataController.saveState(state)
      gameCanvas.clear()
      if (oldContent !== state.content) {
        D.log([
          'The old content: ',
          oldContent,
          ' has changed to: ',
          state.content
        ])
      }
    },
    setView: view => {
      state = loadState()
      var oldView = state.view
      state.view = view
      if (view !== 'menu') state.status.view = view
      dataController.saveState(state)
      gameCanvas.clear()
      if (oldView !== state.view) {
        D.log(['The old view: ', oldView, ' has changed to: ', state.view])
      }
    },
    resetLevelChapterScene: () => {
      state = loadState()
      state.level = 1
      state.chapter = 1
      state.scene = 1
      dataController.saveState(state)
      D.log([
        'level: ',
        state.level,
        ' | chapter: ',
        state.chapter,
        ' | scene: ',
        state.scene
      ])
    },
    setChapter: num => {
      state = loadState()
      state.chapter = num
      dataController.saveState(state)
      D.log([state.chapter])
    },
    newScene: () => {
      state = loadState()
      state.scene += 1
      dataController.saveState(state)
      D.log([state.level])
    },
    changeLanguage: language => {
      state = loadState()
      var oldLanguage = state.language
      state.language = language
      dataController.saveState(state)
      if (oldLanguage !== state.language) {
        D.log([
          'The old language: ',
          oldLanguage,
          ' has changed to: ',
          state.language
        ])
      }
    },
    setContentByStatus: () => {
      state = loadState()
      var oldView = state.view
      state.view = state.status.view
      var oldContent = state.content
      state.content = state.status.content
      dataController.saveState(state)
      gameCanvas.clear()
      if (oldView !== state.view) {
        D.log(['The old view: ', oldView, ' has changed to: ', state.view])
      }
      if (oldContent !== state.content) {
        D.log([
          'The old content: ',
          oldContent,
          ' has changed to: ',
          state.content
        ])
      }
    },
    setStatus: () => {
      state = loadState()
      var oldStateView = state.status.view
      state.status.view = state.view
      var oldStateContent = state.status.content
      state.status.content = state.content
      dataController.saveState(state)
      gameCanvas.clear()
      if (oldStateView !== state.status.view) {
        D.log([
          'The old status view: ',
          oldStateView,
          ' has changed to: ',
          state.status.view
        ])
      }
      if (oldStateContent !== state.status.content) {
        D.log([
          'The old status content: ',
          oldStateContent,
          ' has changed to: ',
          state.status.content
        ])
      }
    },
    setAtmoPath: (atmoPath) => {
      state = loadState()
      state.status.atmoPath = atmoPath
      dataController.saveState(state)
    },
    addItem: (item) => {
      state = loadState()
      switch (item) {
        case 'trivia_A_1':
          state.items.a1 = true
          break
        case 'trivia_A_2':
          state.items.a2 = true
          break
        case 'trivia_A_3':
          state.items.a3 = true
          break
        case 'trivia_A_4':
          state.items.a4 = true
          break
        case 'trivia_B_1':
          state.items.b1 = true
          break
        case 'trivia_B_2':
          state.items.b2 = true
          break
        case 'trivia_B_3':
          state.items.b3 = true
          break
        case 'trivia_B_4':
          state.items.b4 = true
          break
        case 'trivia_C_1':
          state.items.c1 = true
          break
        case 'trivia_C_2':
          state.items.c2 = true
          break
        case 'trivia_C_3':
          state.items.c3 = true
          break
        case 'trivia_D_1':
          state.items.d1 = true
          break
        case 'trivia_D_2':
          state.items.d2 = true
          break
        case 'trivia_D_3':
          state.items.d3 = true
          break
        default:
          console.error('Unexpected place:', item)
          break
      }
      dataController.saveState(state)
      D.log([state.items])
    },
    deleteItem: item => {
      state = loadState()
      delete state.items[state.items.indexOf(item)]
      dataController.saveState(state)
      D.log([state.items])
    },
    resetItems: () => {
      state = loadState()
      state.items = {
        a1  : false,
        a2  : false,
        a3  : false,
        a4  : false,
        b1  : false,
        b2  : false,
        b3  : false,
        b4  : false,
        c1  : false,
        c2  : false,
        c3  : false,
        d1  : false,
        d2  : false,
        d3  : false,
      }
      D.log(['State itmes are removed.'])
      dataController.saveState(state)
    },
    setVolume: num => {
      state = loadState()
      var oldVolume = state.volume
      state.volume = num
      dataController.saveState(state)
      gameCanvas.clear()
      if (oldVolume !== state.view) {
        D.log(['The volume has changed from ', oldVolume, ' to ', state.volume])
      }
    },
    setInitFalse: () => {
      state = loadState()
      state.init = false
      dataController.saveState(state)
      D.log(['The state is not init anymore.'])
    },
    setTransitionSound: (soundPath) => {
      state = loadState()
      state.transitionSound = soundPath
      dataController.saveState(state)
    }
  }
})()

export default stateManager
