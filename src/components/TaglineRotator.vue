<template>
  <div class="tagline-rotator">
    <transition name="tagline-fade" mode="out-in">
      <p :key="currentIndex" class="tagline-rotator__line">
        {{ taglines[currentIndex] }}
      </p>
    </transition>
  </div>
</template>

<script>
const TAGLINES = [
  'Sign with any wallet. Publish any data. Anchored on Ethereum every hour. Always free.',
  'Permissionless publishing. Cross-chain signing. Hourly Ethereum anchoring. Zero gas for users.'
]

const ROTATE_MS = 7000

export default {
  name: 'TaglineRotator',
  data() {
    return {
      taglines: TAGLINES,
      currentIndex: 0,
      timer: null
    }
  },
  mounted() {
    this.startRotation()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  beforeDestroy() {
    this.stopRotation()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  },
  methods: {
    startRotation() {
      if (this.timer) return
      this.timer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.taglines.length
      }, ROTATE_MS)
    },
    stopRotation() {
      if (!this.timer) return
      clearInterval(this.timer)
      this.timer = null
    },
    onVisibilityChange() {
      if (document.hidden) {
        this.stopRotation()
      } else {
        this.startRotation()
      }
    }
  }
}
</script>

<style scoped>
.tagline-rotator {
  text-align: center;
  margin: 0.5rem 0 1.5rem;
  padding: 0 1rem;
  min-height: 2.25em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tagline-rotator__line {
  color: #5100cd;
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.25;
  margin: 0;
  max-width: 56em;
}

.tagline-fade-enter-active,
.tagline-fade-leave-active {
  transition: opacity 0.6s ease;
}

.tagline-fade-enter,
.tagline-fade-leave-to {
  opacity: 0;
}
</style>
