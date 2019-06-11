<template>
  <div id="app">
    <j-header></j-header>
    <router-view :key="$route.path"></router-view>
    
    <j-footer></j-footer>
  </div>
</template>

<script>
import JHeader from '@/components/Header'
import JFooter from '@/components/Footer'

export default {
  components: { JHeader, JFooter },
  name: 'app',
  metaInfo: {
    meta: [
      { charset: 'utf-8' },
      { name: 'theme-color', content: '#ffffff' }
    ]
  }
}
</script>

<style lang="scss">
  
  .Cookie__button {
    background: yellow!important;
    
  }
  .Cookie__button:hover{
    background: greenyellow;
  }
</style>