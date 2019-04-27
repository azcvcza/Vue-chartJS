<template>
  <a
    :href="link"
    :download="name + '.png'"
    title="Download as PNG"
    class="Chart__download"
  >
    🖨
  </a>
</template>

<script>
  export default {
    name: 'DownloadButton',
    props: {
      name: {
        type: String,
        default: 'chart'
      },
      link: {
        type: String,
        default: ''
      }
    }
  }
</script>

<style  scoped>
  .Chart__download
   {
    cursor: pointer;
    border: 1px solid #f1f1f1;
    border-radius: rem(5);
    padding: rem(5);
    text-decoration: none;
   
  }
   .Chart__download:hover {
      border-color: yellow;
    }
</style>