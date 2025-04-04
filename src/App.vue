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
                fill="#FFFFFF"
              ></path>
              <path
                d="M39.8248 149.368C54.1406 149.368 65.6493 137.859 65.6493 123.614C65.6493 109.368 54.0704 97.8594 39.8248 97.8594C25.5091 97.8594 14.0003 109.368 14.0003 123.614C13.9301 137.859 25.5091 149.368 39.8248 149.368Z"
                fill="#FFFFFF"
              ></path>
              <path
                d="M109.86 17.5789C85.369 7.47363 56.1059 12.3157 36.1761 32.1052C16.2463 51.9648 11.4042 81.0173 21.5095 105.438L109.86 17.5789Z"
                fill="#FFFFFF"
              ></path>
              <path
                d="M58.0713 141.859C82.5625 151.965 111.826 147.123 131.755 127.333C151.685 107.473 156.527 78.4209 146.422 53.9999L58.0713 141.859Z"
                fill="#FFFFFF"
              ></path>
            </svg>
          </span>
          <div class="styles__StyledLink-sc-syqzwc-0 jDyAjk">
            <a target="_blank" href="https://console.aleph.im/">
              <div class="styles__StyledRouterLink-sc-11bcwqi-1 fnIBfA tp-nav">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 502 512"
                  theme="[object Object]"
                  class="cmp__StyledCustomIcon-sc-9v58yf-0 htIPLr styles__StyledRouteLinkIcon-sc-11bcwqi-2 ioOCuj"
                >
                  <path
                    d="M246.9 60.3a194.5 194.5 0 1 0 0 388.9 194.5 194.5 0 1 0 0-388.9zM158.5 303.5c-3 3-7.1 4.6-11.1 4.6s-8-1.6-11.1-4.6c-6.2-6.2-6.2-16.1 0-22.2l11.1-11.1 19-19-19-19-11.1-11.1c-6.2-6.2-6.2-16.1 0-22.2c6.1-6.2 16.1-6.2 22.2 0l41.2 41.2c2.9 2.9 4.6 6.9 4.6 11.1s-1.7 8.2-4.6 11.1l-41.2 41.2zm187.8 11.6H218c-8.7 0-15.7-7-15.7-15.7s7-15.7 15.7-15.7H346.3c8.7 0 15.7 7 15.7 15.7s-7 15.7-15.7 15.7z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div class="styles__StyledLink-sc-syqzwc-0 jDyAjk">
            <a target="_blank" href="https://account.aleph.im/">
              <div class="styles__StyledRouterLink-sc-11bcwqi-1 jNoQOw tp-nav">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 478 512"
                  theme="[object Object]"
                  class="cmp__StyledCustomIcon-sc-9v58yf-0 htIPLr styles__StyledRouteLinkIcon-sc-11bcwqi-2 ioOCuj"
                >
                  <path
                    d="M238.9 464.7c-68.7 0-137.3-15.2-189.6-45.5c-14-8.2-26.3-17.1-37-26.7v.5s.2 .5 .2 .9c4 28.1 26 55.1 62.3 76.1c90.5 52.5 237.8 52.5 328.1 0c36.1-20.9 58.3-48 62.3-76.1c0-.3 0-.5 0-.9v-.5c-10.6 9.6-22.9 18.5-36.8 26.7c-52.3 30.4-120.9 45.5-189.6 45.5h.2zM467.8 303.4c-5.4 6.1-11.5 11.9-18.1 17.4c-7.5 6.1-15.9 12-24.8 17.4c-1.6 .9-2.8 1.9-4.4 2.8c-50.1 29.1-115.8 43.6-181.6 43.6s-131.5-14.5-181.6-43.6c-1.6-.9-2.8-1.9-4.4-2.8c-8.9-5.4-17.3-11.3-24.8-17.4c-6.8-5.6-12.7-11.3-18.1-17.4c-3.1-3.5-6.1-7-8.7-10.5c-.2 2.1-.5 4-.5 6.1c0 1.4 .3 3 .3 4.4c.3 5.9 1.4 11.7 3.3 17.4c1.9 5.9 4.5 11.7 7.8 17.4c11 18.5 29.3 35.9 54.8 50.6c94.9 55.1 249.3 55.1 344.2 0C436.7 374 455 356.7 466 338.2c3.3-5.8 5.9-11.5 7.8-17.4c1.7-5.8 2.8-11.5 3.3-17.4c0-1.4 .3-3 .3-4.4c0-2.1-.3-4-.5-6.1c-2.6 3.7-5.6 7.2-8.7 10.5h-.5zm-186.8 .1c-14 1.2-27.9 2.1-42 2.1s-28.1-.9-42-2.1C142.8 298.6 91 284.1 49.3 260c-9.1-5.2-17.3-11-24.9-16.9c-4.2-3.1-8.2-6.3-12-9.6v.5s.2 .5 .2 .9c.9 5.6 2.4 11.2 4.7 16.7c7.5 18.8 23.2 36.6 45.7 51.8c3.8 2.6 7.7 5.1 11.9 7.5c6.1 3.7 12.6 6.8 19.4 9.9c15.3 7.2 32.1 12.9 49.4 17.4c60.5 15.9 130.3 15.9 190.8 0c17.4-4.5 34-10.3 49.4-17.4c6.6-3.1 13.1-6.5 19.4-9.9c4.2-2.4 8-4.9 11.9-7.5c22.5-15.3 38-33.1 45.7-52c2.3-5.6 4-11 4.7-16.7c0-.3 0-.5 0-.9v-.5c-3.7 3.3-7.7 6.5-11.9 9.6c-7.7 5.9-15.9 11.7-24.9 16.9C387 283.9 335 298.4 280.9 303.3v.2zM4.3 161.8c1.9 5.9 4.5 11.7 7.8 17.4s7.5 11.3 12.2 16.7c3.7 4.2 7.8 8.4 12.4 12.4c4.4 3.8 9.1 7.5 14.1 11.2c5.1 3.5 10.3 7 16 10.3c94.9 55.1 249.3 55.1 344.2 0c5.8-3.3 11-6.8 16-10.3c5.1-3.7 9.8-7.3 14.1-11.2c4.5-4 8.7-8.2 12.4-12.4c4.7-5.4 8.9-11 12.2-16.7s5.9-11.5 7.8-17.4c1.7-5.8 2.8-11.5 3.3-17.4c0-1.4 .3-3 .3-4.4c0-33.1-23.5-65.2-66.3-90C363.6 22.4 301.4 8.6 239.1 8.6s-124.5 13.8-172 41.3C24.4 74.7 .8 106.7 .8 140c0 1.4 .3 3 .3 4.4c.3 5.9 1.4 11.7 3.3 17.4H4.3z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div class="active">
            <a target="_blank" class="active" href="https://explorer.aleph.im/">
              <div class="styles__StyledRouterLink-sc-11bcwqi-1 fnIBfA tp-nav">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 736 512"
                  theme="[object Object]"
                  class="cmp__StyledCustomIcon-sc-9v58yf-0 htIPLr styles__StyledRouteLinkIcon-sc-11bcwqi-2 ioOCuj"
                >
                  <path
                    d="M443.2 369.3c-41.3 0-81.1-5-119.2-14.1v54.2c37.9 9.9 77.9 15 119.2 15c159 0 288.3-72.2 288.3-160.8v-2.2c-51.4 64.3-159.7 108-288.3 108v-.2zM597 194.7c1.3-2.9 2.2-5.9 2.9-8.8c0 0 0-.2 0-.3c.6-3 1-6.1 1-9.1c0-17.4-10.7-34.7-30.2-49.1c-.2 0-.5-.3-.6-.5c-2.9-2.1-6.1-4.3-9.4-6.2c-.6-.3-1.1-.6-1.8-1c-2.9-1.8-5.9-3.4-9.1-5c-1-.5-1.8-1-2.7-1.3c-6.4-3-13.4-5.9-20.5-8.3c-1.3-.5-2.6-.8-3.8-1.3c-7-2.2-14.4-4.3-21.9-5.9c-1.4-.3-2.9-.6-4.3-.8c-7.8-1.6-15.7-2.9-23.8-3.7c-1 0-2.1-.2-3-.3c-8.6-.8-17.4-1.3-26.4-1.3s-17.8 .5-26.4 1.3c-1.1 0-2.1 0-3.2 .3c-8.2 .8-16 2.1-23.8 3.7c-1.4 .3-2.9 .6-4.3 1c-7.5 1.6-14.7 3.7-21.8 5.9c-1.3 .5-2.6 .8-3.8 1.3c-7.2 2.4-14.1 5.3-20.5 8.3c-1 .5-1.8 .8-2.7 1.3c-3.2 1.6-6.2 3.2-9.1 5c-.6 .3-1.3 .8-1.9 1.1c-3.2 1.9-6.4 4-9.3 6.1c-.3 .2-.5 .3-.8 .6c-3.2 2.4-6.1 4.8-8.8 7.2c-13.8 12.8-21.4 27.2-21.4 41.9c0 3 .3 6.1 1 9.1c0 0 0 .2 0 .3c.6 2.9 1.6 5.9 2.9 8.8c35-29.9 91.7-48 153.8-48s118.7 17.9 153.8 48l.5-.3zm134.6-18.2c0-88.6-129.4-160.8-288.3-160.8s-288.3 72.2-288.3 160.8c0 23.4 9.4 46.4 28.2 68.2c3 3.7 4.5 8.5 3.7 13.1s-3.7 8.8-7.7 11.2l-21.8 12.6-8.2 4.8-1.4 .8-5 2.9-14.2 8.2h-.3L20.5 360.9l43.2 25.1 16 9.3 16 9.3 30.2 17.6L300.3 320.9c1.8-1 3.5-1.6 5.4-1.9c.5 0 .8 0 1.1-.2c1.9-.2 3.8 0 5.8 .5c41.3 12 85.3 17.9 130.9 17.9c159 0 288.3-72.2 288.3-160.8h-.3zM258.9 204.6s-.2-.5-.3-.6c-1.4-4-2.7-8-3.5-12.2c0-.5-.3-1.1-.5-1.6c-.8-4.5-1.3-9-1.3-13.6s.5-8.6 1.1-13c.2-1 .5-1.9 .6-2.9c.6-3.4 1.6-6.6 2.7-9.8c.3-1 .8-1.9 1.1-2.9c1.3-3.2 2.7-6.4 4.5-9.6c.5-.8 1-1.6 1.4-2.4c1.9-3.4 4.2-6.6 6.6-9.8c.5-.5 .8-1.1 1.3-1.6c2.7-3.5 5.9-7 9.3-10.4c0 0 .2-.3 .3-.3c27.7-27.5 73.4-46.9 127.8-52.6c1 0 1.8-.2 2.7-.3c9.9-1 20-1.6 30.4-1.6s20.5 .6 30.4 1.6c1 0 1.8 0 2.7 .3c54.4 5.8 100.2 25.1 127.8 52.6c0 0 .2 .3 .3 .3c3.4 3.4 6.4 6.7 9.3 10.4c.5 .5 .8 1.1 1.3 1.6c2.4 3.2 4.5 6.4 6.4 9.8c.5 .8 1 1.6 1.4 2.4c1.8 3.2 3.2 6.4 4.5 9.6c.3 1 .8 1.9 1.1 2.9c1.1 3.2 1.9 6.6 2.7 9.8c.2 1 .5 1.9 .6 2.9c.8 4.2 1.1 8.5 1.1 13c0 4.6-.5 9.1-1.3 13.6c0 .6-.3 1.1-.5 1.8c-.8 4.2-2.1 8.2-3.5 12.2c0 .3-.2 .5-.3 .8c-20 51.5-93.6 88.8-184.2 88.8s-164.3-37.3-184.2-88.8l-.2-.3zM63.5 423l-8-4.6-8-4.6-16-9.1-27-15.8v31.5 18.6 .2l90.7 52.6 14.2 8.3V449.7L92 439.7 63.5 423zm77.9 77l114.2-66.4 36.3-21V362.4L141.4 449.7V500z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
          <div class="styles__StyledLink-sc-syqzwc-0 jDyAjk">
            <a target="_blank" href="https://swap.aleph.im/">
              <div class="styles__StyledRouterLink-sc-11bcwqi-1 fnIBfA tp-nav">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 365 512"
                  theme="[object Object]"
                  class="cmp__StyledCustomIcon-sc-9v58yf-0 htIPLr styles__StyledRouteLinkIcon-sc-11bcwqi-2 ioOCuj"
                >
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
