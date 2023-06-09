import GameBoard from "./views/GameBoard/GameBoard.vue";
import Dashboard from "./views/Dashboard/Dashboard.vue";
import { createWebHistory, createRouter } from "vue-router"

const routes = [
    { path: "/", component: GameBoard },
    { path: "/dashboard", component: Dashboard },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router