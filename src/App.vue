<template>
  <div id="app">
    <div class="main-wrapper main-wrapper-1">
      <div class="main-zone">
        <div class="navbar-bg"></div>
        <nav class="navbar navbar-expand-lg main-navbar">
          <ul class="navbar-nav mr-auto mr-3">
            <li v-if="window.width < 1024"><b-link @click="display_menu = !display_menu" href="#" class="nav-link nav-link-lg"><i class="fas fa-bars"></i></b-link></li>
          </ul>
          <b-navbar-brand v-if="window.width < 1024" to="/">Aleph Explorer</b-navbar-brand>
          <form class="form-inline ml-auto">
            <ul class="navbar-nav">
              <li><a href="#" data-toggle="search" class="nav-link nav-link-lg d-sm-none"><i class="fas fa-search"></i></a></li>
            </ul>
            <div class="search-element">
              <input class="form-control" type="search" placeholder="Search" aria-label="Search">
              <button class="btn" type="submit"><i class="fas fa-search"></i></button>
            </div>
          </form>
        </nav>

        <!-- Main Content -->
        <div class="main-content">
          <section class="section">
            <router-view/>
          </section>
        </div>
        <footer class="main-footer">
          <div class="footer-left">
            Copyright © 2019<div class="bullet"></div> <a href="https://aleph.im">Aleph.im</a>
          </div>
          <div class="footer-right">
            v0.1.0
          </div>
        </footer>
      </div>
      <transition name="fade">
        <div class="main-sidebar" v-if="window.width >= 1024 | display_menu">
          <aside id="sidebar-wrapper">
            <div class="sidebar-brand">
              <b-link target="/">Aleph.im<br/>Explorer</b-link>
            </div>
            <ul class="sidebar-menu">
              <li class="menu-header">Dashboard</li>
              <b-nav-item to="/">
                <i class="fas fa-chart-line"></i><span>General Dashboard</span>
              </b-nav-item>
            </ul>
            <div class="p-3 mt-4 mb-4 hide-sidebar-mini">
              <b-link to="/about" class="btn btn-primary btn-lg btn-icon-split btn-block">
                <i class="far fa-question-circle"></i> <div>About</div>
              </b-link>
            </div>
          </aside>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    console.log(this.$mq)
    return {
      window: {
        width: 0,
        height: 0
      },
      'display_menu': false
    }
  },
  created() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize();
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    }
  }
}
</script>

<style lang="scss">
@import '~bootstrap/dist/css/bootstrap.css';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import '~stisla-theme/dist/scss/style.scss';

/* optional imports */
@import '~stisla-theme/dist/scss/components.scss';

@import './assets/style.scss';

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
