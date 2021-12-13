import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Layout from '../views/layout/index.vue';

  Vue.use(VueRouter);

  const routes: Array<RouteConfig> = [
			{
			path: '/',
			name: 'layout',
			component: Layout,
			redirect: "/home",
			children:[
				{
					path: '/home',
					name: 'home',
					component: Home
				},
				{
					path: '/about',
					name: 'about',
					component: About
				},
			]
			}
	]

const router = new VueRouter({
  routes
})

export default router
