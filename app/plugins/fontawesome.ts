import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faCar, faLock, faShieldAlt, faCheckCircle, faExclamationTriangle, faSearch, faTimes, faSpinner, faChevronLeft, faChevronRight, faChevronDown, faArrowLeft, faClock, faPaperPlane, faSync, faPhone, faEye, faEyeSlash, faGift, faWallet, faArrowRight, faLightbulb, faBullhorn, faKey, faCalendarDay, faBolt, faChartLine, faUsers, faUserCheck, faTags, faHouse, faClipboardList, faComments, faPenToSquare, faTrash, faCheck, faPlus, faSun, faMoon, faBell, faFilter, faCircleCheck, faBan, faHeadset, faImage, faRotate, faPaperclip, faMicrophone, faCheckDouble, faPlay, faPause, faMedal, faUserPlus, faHourglassHalf, faMoneyBill, faTrophy } from '@fortawesome/free-solid-svg-icons'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// You can add more icons here
library.add(faUser, faCar, faLock, faShieldAlt, faCheckCircle, faExclamationTriangle, faSearch, faTimes, faSpinner, faChevronLeft, faChevronRight, faChevronDown, faArrowLeft, faClock, faPaperPlane, faSync, faPhone, faEye, faEyeSlash, faGift, faWallet, faArrowRight, faLightbulb, faBullhorn, faKey, faCalendarDay, faBolt, faChartLine, faUsers, faUserCheck, faTags, faHouse, faClipboardList, faComments, faPenToSquare, faTrash, faCheck, faPlus, faSun, faMoon, faBell, faFilter, faCircleCheck, faBan, faHeadset, faImage, faRotate, faPaperclip, faMicrophone, faCheckDouble, faPlay, faPause, faMedal, faUserPlus, faHourglassHalf, faMoneyBill, faTrophy)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
