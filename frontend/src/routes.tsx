import GameBoard from "./views/GameBoard.vue";
import Dashboard from "./views/Dashboard.vue";
import { createWebHashHistory, createRouter } from "vue-router"

const routes = [
    { path: "/", component: GameBoard },
    { path: "/dashboard", component: Dashboard },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router