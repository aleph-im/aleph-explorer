<template>
  <div id="app">
    <div class="main-wrapper main-wrapper-1">
      <div class="main-zone">
        <div class="navbar-bg"></div>
        <nav class="navbar navbar-expand-lg main-navbar">
          <ul class="navbar-nav mr-auto mr-3">
            <li v-if="window.width < 1024">
              <b-link
                @click="display_menu = !display_menu"
                href="#"
                class="nav-link nav-link-lg"
                ><i class="fas fa-bars"></i
              ></b-link>
            </li>
          </ul>
          <b-navbar-brand v-if="window.width < 1024" to="/"
            >Aleph Cloud</b-navbar-brand
          >
          <b-navbar-brand v-else to="/"
            >Aleph Cloud network Explorer</b-navbar-brand
          >
        </nav>

        <!-- Main Content -->
        <div class="main-content">
          <section class="section">
            <router-view />
          </section>
        </div>
        <footer class="main-footer px-5">
          <div class="footer-left">
            Copyright © 2018-present <a href="https://aleph.im">Aleph Cloud</a>
          </div>
          <div class="footer-right">
            <template v-if="app_version">
              <template v-if="last_release_is_a_tag()">
                <a
                  :href="
                    'https://github.com/aleph-im/aleph-explorer/tree/' +
                    app_version
                  "
                  >{{ app_version }}</a
                >
              </template>
              <template v-else>
                {{ app_version }}
              </template>
            </template>
            <a
              href="https://github.com/aleph-im/aleph-explorer"
              class="card-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fab fa-github"></i>
            </a>
          </div>
        </footer>
      </div>
      <transition name="fade">
        <div class="main-sidebar" v-if="(window.width >= 1024) | display_menu">
          <aside id="sidebar-wrapper">
            <div class="d-lg-none close-button" @click="display_menu = false">
              <i class="fas fa-times"></i>
            </div>
            <div class="sidebar-brand">
              <b-link target="/">Aleph Cloud<br />Explorer</b-link>
            </div>
            <ul class="sidebar-menu">
              <li class="menu-header">Dashboard</li>
              <b-nav-item to="/">
                <i class="fas fa-chart-line"></i><span>General Dashboard</span>
              </b-nav-item>
              <li class="menu-header">Insights</li>
              <b-nav-item to="/messages">
                <i class="fas fa-inbox"></i><span>Messages</span>
              </b-nav-item>
              <b-nav-item to="/addresses">
                <i class="fas fa-address-book"></i><span>Addresses</span>
              </b-nav-item>
            </ul>
            <div class="p-3 mt-4 mb-4 hide-sidebar-mini">
              <b-link
                to="/about"
                class="btn btn-primary btn-lg btn-icon-split btn-block"
              >
                <i class="far fa-question-circle"></i>
                <div>About</div>
              </b-link>
            </div>
          </aside>
        </div>
      </transition>
      <!-- left bar to navigate between brand sites -->
      <div class="navigator" v-if="window.width >= 1024">
        <nav class="site-navigator">
          <span class="logo">
            <svg
              height="1.2em"
              viewBox="0 0 168 168"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M128.176 61.5087C142.491 61.5087 154 49.9999 154 35.7543C154 21.5087 142.421 10 128.176 10C113.86 10 102.351 21.5087 102.351 35.7543C102.351 49.9999 113.86 61.5087 128.176 61.5087Z"
              ></path>
              <path
                d="M39.8248 149.368C54.1406 149.368 65.6493 137.859 65.6493 123.614C65.6493 109.368 54.0704 97.8594 39.8248 97.8594C25.5091 97.8594 14.0003 109.368 14.0003 123.614C13.9301 137.859 25.5091 149.368 39.8248 149.368Z"
              ></path>
              <path
                d="M109.86 17.5789C85.369 7.47363 56.1059 12.3157 36.1761 32.1052C16.2463 51.9648 11.4042 81.0173 21.5095 105.438L109.86 17.5789Z"
              ></path>
              <path
                d="M58.0713 141.859C82.5625 151.965 111.826 147.123 131.755 127.333C151.685 107.473 156.527 78.4209 146.422 53.9999L58.0713 141.859Z"
              ></path>
            </svg>
          </span>
          <div>
            <a target="_blank" href="https://console.aleph.im/">
              <div class="styles__StyledRouterLink-sc-11bcwqi-1 fnIBfA tp-nav">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 512">
                  <path
                    d="M246.9 60.3a194.5 194.5 0 1 0 0 388.9 194.5 194.5 0 1 0 0-388.9zM158.5 303.5c-3 3-7.1 4.6-11.1 4.6s-8-1.6-11.1-4.6c-6.2-6.2-6.2-16.1 0-22.2l11.1-11.1 19-19-19-19-11.1-11.1c-6.2-6.2-6.2-16.1 0-22.2c6.1-6.2 16.1-6.2 22.2 0l41.2 41.2c2.9 2.9 4.6 6.9 4.6 11.1s-1.7 8.2-4.6 11.1l-41.2 41.2zm187.8 11.6H218c-8.7 0-15.7-7-15.7-15.7s7-15.7 15.7-15.7H346.3c8.7 0 15.7 7 15.7 15.7s-7 15.7-15.7 15.7z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div>
            <a target="_blank" href="https://account.aleph.im/">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 338 512">
                  <path
                    d="M110.8 280.2s-.8-.5-1.2-.8c-6-4.1-11.2-9-15.4-14.9L82.4 253C60.3 278.1 43.7 308 38.4 335.8L10.4 479l24.3 24.3L59.3 377.3c6.4-33.2 25.6-68.1 51.7-97c0 0 0 0-.1 0v-.1zM75.5 209.4s.7 .5 1 .9l4.7 4.6c1-62 49-137.6 110.1-173.1c17-9.9 33.7-15.7 49.3-17.4L233.4 17s-.7-.8-1-1.2c-6.7-8.4-16.7-12.6-29-12.6c-13.2 0-28.8 4.8-45.4 14.5c-53.6 31.1-97.2 99.7-97.2 152.6c0 14.3 3.3 26 9.7 34c1.3 1.7 3 3.3 5.2 5.1l-.1-.1zm235.3 27.6c-2-7.6-5.5-13.3-10.3-17.4c-1.6-1.3-3.4-2.4-5.2-3.4c-.1 0-.4-.3-.5-.3c-.4-.1-.7-.4-1-.7c-1.4-.7-3.1-1-4.8-1.4c-.4 0-.8-.3-1-.3c-2.1-.5-4.3-.7-6.5-.8c-.4 0-.8 0-1.3 0s-1-.1-1.7-.1c-1.3 0-2.7 .3-4.2 .4c-1.3 0-2.5 .1-3.8 .4c-.3 0-.7 0-.9 0c-15.2 19.7-33.3 37.5-53.2 51.1c-3.8 2.6-7.6 5-11.4 7.2c-20.5 11.9-40.7 17.9-58.7 17.9c-2.4 0-4.6-.1-6.8-.4c-26.9 26.8-47.6 61.3-53.9 93L61.5 504 337.8 343.5 311 236.9h-.3zM109.5 194.7c-1.2 5.9-1.8 11.8-2.1 17.4c0 1.6-.3 3.3-.3 4.8c0 3.7 .3 7.6 .8 11.5c1 6.9 3.1 14 7.2 20c1.6 2.5 3.7 4.7 5.9 6.7c.1 0 .3 .3 .4 .4c1.3 1.2 2.7 2.4 4.3 3.3c.7 .4 1.6 .7 2.2 1c.1 0 .4 .1 .5 .3c.7 .3 1.3 .7 2 .9c1.7 .7 3.5 1.2 5.4 1.6c.3 0 .7 .1 .9 .3c3 .5 6.1 .8 9.4 .7c.7 0 1.2 .1 1.7 0c2.5 0 5-.4 7.6-.8c.7 0 1.4-.3 2.1-.4c2.6-.5 5.2-1.2 7.8-2c1.2-.4 2.4-.8 3.5-1.2c2.5-.8 5-1.8 7.5-2.9c1.2-.5 2.4-.9 3.5-1.6c3.7-1.7 7.3-3.5 11.1-5.8c3.4-2 6.7-4.1 9.9-6.3c13.6-9.3 26.3-20.8 37.5-33.6c5.4-6.1 10.5-12.6 15.2-19.2c0 0 0 0 0-.1c2.2-3.1 4.4-6.4 6.4-9.7c2.5-3.8 4.7-7.7 6.8-11.6c2.2-4.1 4.3-8.2 6.1-12.3c9.4-20.3 14.9-40.8 14.9-59.5c0-3.5-.3-7.5-.8-11.2c0-.1 0-.4 0-.5c-1.4-9.5-4.8-19.5-12.6-26.3c-1.6-1.4-3.3-2.6-5.2-3.8c-5.6-3.3-12.4-4.8-20-4.8c-13.2 0-28.9 5-45.4 14.5c-46.3 26.9-85.1 81.7-94.8 130.4l.4-.1z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div class="active">
            <a target="_blank" class="active" href="https://explorer.aleph.im/">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 736 512">
                  <path
                    d="M443.2 369.3c-41.3 0-81.1-5-119.2-14.1v54.2c37.9 9.9 77.9 15 119.2 15c159 0 288.3-72.2 288.3-160.8v-2.2c-51.4 64.3-159.7 108-288.3 108v-.2zM597 194.7c1.3-2.9 2.2-5.9 2.9-8.8c0 0 0-.2 0-.3c.6-3 1-6.1 1-9.1c0-17.4-10.7-34.7-30.2-49.1c-.2 0-.5-.3-.6-.5c-2.9-2.1-6.1-4.3-9.4-6.2c-.6-.3-1.1-.6-1.8-1c-2.9-1.8-5.9-3.4-9.1-5c-1-.5-1.8-1-2.7-1.3c-6.4-3-13.4-5.9-20.5-8.3c-1.3-.5-2.6-.8-3.8-1.3c-7-2.2-14.4-4.3-21.9-5.9c-1.4-.3-2.9-.6-4.3-.8c-7.8-1.6-15.7-2.9-23.8-3.7c-1 0-2.1-.2-3-.3c-8.6-.8-17.4-1.3-26.4-1.3s-17.8 .5-26.4 1.3c-1.1 0-2.1 0-3.2 .3c-8.2 .8-16 2.1-23.8 3.7c-1.4 .3-2.9 .6-4.3 1c-7.5 1.6-14.7 3.7-21.8 5.9c-1.3 .5-2.6 .8-3.8 1.3c-7.2 2.4-14.1 5.3-20.5 8.3c-1 .5-1.8 .8-2.7 1.3c-3.2 1.6-6.2 3.2-9.1 5c-.6 .3-1.3 .8-1.9 1.1c-3.2 1.9-6.4 4-9.3 6.1c-.3 .2-.5 .3-.8 .6c-3.2 2.4-6.1 4.8-8.8 7.2c-13.8 12.8-21.4 27.2-21.4 41.9c0 3 .3 6.1 1 9.1c0 0 0 .2 0 .3c.6 2.9 1.6 5.9 2.9 8.8c35-29.9 91.7-48 153.8-48s118.7 17.9 153.8 48l.5-.3zm134.6-18.2c0-88.6-129.4-160.8-288.3-160.8s-288.3 72.2-288.3 160.8c0 23.4 9.4 46.4 28.2 68.2c3 3.7 4.5 8.5 3.7 13.1s-3.7 8.8-7.7 11.2l-21.8 12.6-8.2 4.8-1.4 .8-5 2.9-14.2 8.2h-.3L20.5 360.9l43.2 25.1 16 9.3 16 9.3 30.2 17.6L300.3 320.9c1.8-1 3.5-1.6 5.4-1.9c.5 0 .8 0 1.1-.2c1.9-.2 3.8 0 5.8 .5c41.3 12 85.3 17.9 130.9 17.9c159 0 288.3-72.2 288.3-160.8h-.3zM258.9 204.6s-.2-.5-.3-.6c-1.4-4-2.7-8-3.5-12.2c0-.5-.3-1.1-.5-1.6c-.8-4.5-1.3-9-1.3-13.6s.5-8.6 1.1-13c.2-1 .5-1.9 .6-2.9c.6-3.4 1.6-6.6 2.7-9.8c.3-1 .8-1.9 1.1-2.9c1.3-3.2 2.7-6.4 4.5-9.6c.5-.8 1-1.6 1.4-2.4c1.9-3.4 4.2-6.6 6.6-9.8c.5-.5 .8-1.1 1.3-1.6c2.7-3.5 5.9-7 9.3-10.4c0 0 .2-.3 .3-.3c27.7-27.5 73.4-46.9 127.8-52.6c1 0 1.8-.2 2.7-.3c9.9-1 20-1.6 30.4-1.6s20.5 .6 30.4 1.6c1 0 1.8 0 2.7 .3c54.4 5.8 100.2 25.1 127.8 52.6c0 0 .2 .3 .3 .3c3.4 3.4 6.4 6.7 9.3 10.4c.5 .5 .8 1.1 1.3 1.6c2.4 3.2 4.5 6.4 6.4 9.8c.5 .8 1 1.6 1.4 2.4c1.8 3.2 3.2 6.4 4.5 9.6c.3 1 .8 1.9 1.1 2.9c1.1 3.2 1.9 6.6 2.7 9.8c.2 1 .5 1.9 .6 2.9c.8 4.2 1.1 8.5 1.1 13c0 4.6-.5 9.1-1.3 13.6c0 .6-.3 1.1-.5 1.8c-.8 4.2-2.1 8.2-3.5 12.2c0 .3-.2 .5-.3 .8c-20 51.5-93.6 88.8-184.2 88.8s-164.3-37.3-184.2-88.8l-.2-.3zM63.5 423l-8-4.6-8-4.6-16-9.1-27-15.8v31.5 18.6 .2l90.7 52.6 14.2 8.3V449.7L92 439.7 63.5 423zm77.9 77l114.2-66.4 36.3-21V362.4L141.4 449.7V500z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div>
            <a target="_blank" href="https://swap.aleph.im/">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 512">
                  <path
                    d="M257.3 189.4l64.9 37.7V183.9l-70.5-41-127.2 74v43.2l121.5-70.5c3.5-2 7.9-2 11.4 0v-.1zM101.5 260V216.7l-9.2-5.3L52.5 188.3l-11.3-6.6-11.4-6.6L4 160.1v30 13.2l70.4 41L101.5 260zM71.3 81.5l1.4-.8L94 68.3l14.6-8.4L75 40.3 60.6 32V69.9v5.3l9.7 5.6 1 .7zm-7.5 87l11.4 6.6 37.8 22 132.9-77.3c3.5-2 7.9-2 11.4 0l67.6 39.3 9.1-57.9 3.4-21.4 1.8-11.5L341 56.8l7.4-47.1L88.5 21.6 137 49.8c3.5 2 5.7 5.8 5.7 9.8c0 2.3-.8 4.4-2 6.4c-.9 1.4-2.2 2.6-3.6 3.5l-5.7 3.3L122 78.3l-2 1.1L100.7 90.6l-6.6 3.8-11.4 6.6-11.4 6.6L15.2 140.1l37.2 21.6 11.4 6.6v.2zM335.2 343l-11.4 6.6-11.3 6.5-15.4 9-40.7 23.7 37.2 21.6 15.2-8.9L361 371.2v-.1V358.1 328l-25.8 15zM228 378.9l61.8-36 11.4-6.6 11.4-6.6 37.2-21.6-97.6-56.7L119.2 328.7c-3.5 2-7.9 2-11.4 0L40.3 289.4l-6.4 40.3-1.8 11.4L16.7 438.7l11-.5 194.7-9 11.4-.6 11.4-.6 19.2-.9 12.2-.6-5.6-3.3-25.8-15-11.4-6.6-5.7-3.3c-3.5-2-5.7-5.8-5.7-9.8s2.2-7.9 5.7-9.8H228zm43 70.9l-24.6 1.1-12.6 .7-9.2 .3h-.2l-1.9 .1L24.1 461.1l-9.4 .5v46.8l282.9-13 6.8-.3v-8.9V448.3L271 449.8z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
export default {
  name: "app",
  data() {
    return {
      window: {
        width: 0,
        height: 0,
      },
      display_menu: false,
      app_version: GIT_DESCRIBE_TAGS || "unknown build",
    };
  },
  computed: mapState({
    account: (state) => state.account,
    api_server: (state) => state.api_server,
    profiles: (state) => state.profiles,
  }),
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.loadAddresses();

    if (GIT_DESCRIBE_TAGS) {
      console.warn(`
No build version detected.
This bundle was probably not built from a git repository,
or your build process might be broken! `);
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    async loadAddresses() {
      // VERY BAD, we load everything for now!
      // TODO: gotta do it on demand.
      let response = await axios.get(
        `${this.api_server.protocol}//${this.api_server.host}/api/v0/addresses/stats.json`
      );
      this.$store.commit("set_addresses_stats", response.data.data);
    },
    last_release_is_a_tag() {
      return /\d+-.[0-9A-F]{7}$/i.test(this.app_version);
    },
  },
  watch: {
    $route(to, from) {
      this.display_menu = false;
    },
    async "api_server.host"() {
      await this.loadAddresses();
    },
  },
};
</script>

<style lang="scss">
@import "~bootstrap/dist/css/bootstrap.css";
@import "~bootstrap-vue/dist/bootstrap-vue.css";

/* optional imports */
@import "./assets/stisla-style.scss";
@import "~stisla-theme/dist/scss/components.scss";

@import "./assets/style.scss";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
