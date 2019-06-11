import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import StartPage from '@/pages/Start'


Vue.use(Router)

export default new Router({
    routes: [{
            path: '/',
            name: 'Start',
            component: StartPage
        },
        {
            path: '/:package',
            name: 'Package',
            component: StartPage
        }
    ],
    //mode: 'history' -> this made bundle failed 

})