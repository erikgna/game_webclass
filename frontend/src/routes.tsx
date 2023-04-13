import GameBoard from "./views/GameBoard.vue";
import Dashboard from "./views/Dashboard.vue";
import { createMemoryHistory, createRouter } from "vue-router"

const routes = [
    { path: "/", component: GameBoard },
    { path: "/dashboard", component: Dashboard },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router