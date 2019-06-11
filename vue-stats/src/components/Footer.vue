<template>
  <footer>
   <span> Build with <a href="https://vuejs.org/" target="_new">Vue.js</a> and <a href="http://vue-chartjs.org/#/" target="_new">vue-chartjs</a></span>
   
  
  </footer>
</template>

<script>
  export default {
  }
</script>

<style lang="css">
 
  footer {
    background-color: color(fjord);
    color:lightgrey;
    font-size: rem(16);
    padding: rem(30) rem(40);
    display: flex;
    justify-content: center;
    flex-flow: row nowrap;
    
  }
  footer a {
      color: lightskyblue;
      
    }
  footer a:hover{
    border-color: beige
  }
</style>
