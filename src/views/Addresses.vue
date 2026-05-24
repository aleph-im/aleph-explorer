<template>
  <div>
    <b-card no-body class="card-primary">
      <b-card-header class="d-flex align-items-center flex-wrap">
        <h4 class="mb-0 mr-3">
          Addresses <b-spinner small class="ml-3" label="Loading addresses" v-if="is_loading" />
        </h4>

        <b-input-group class="addresses-search ml-auto">
          <b-form-input v-model="filter" placeholder="Search by address" />
          <b-input-group-append>
            <b-button variant="primary" :disabled="!filter" @click="clearFilter">
              <i class="fas fa-times"></i> Clear
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-card-header>

      <!-- Table implementation for addresses -->
      <b-table responsive table-class="compact mb-0 addresses-table"
        :class="{ 'is-loading-data': is_loading }"
        :items="items" :fields="addresses_fields"
        :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" @sort-changed="loadAddresses">
        <template v-slot:cell(address)="data">
          <AddressLink :address="data.value" class="address" />
        </template>
      </b-table>

      <b-card-footer class="d-flex justify-content-between align-items-center bg-whitesmoke">
        <span>Total: {{ total }}</span>
        <b-pagination v-model="page" :total-rows="total" :per-page="per_page" limit="9"
          class="mb-0 d-none d-md-inline-flex" size="sm" @change="changePage">
        </b-pagination>
        <b-pagination v-model="page" :total-rows="total" :per-page="per_page" limit="3"
          class="mb-0 d-md-none" size="sm" @change="changePage">
        </b-pagination>
      </b-card-footer>
      <!--
        <b-card-body class="p-0">
          <MessageTable :messages="last_messages" striped hover table-class="compact mb-0 table-nowrap" />
        </b-card-body> -->
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AddressLink from '@/components/AddressLink'

export default {
  name: 'about',
  data() {
    return {
      per_page: 20,
      page: 1,
      filter: '',
      sortBy: 'total',
      sortDesc: true,
      sortDirection: 'desc',
      addresses_fields: [
        { key: 'address', label: 'Address', sortable: false },
        { key: 'post', label: 'Posts count', class: 'text-right', sortable: true },
        { key: 'aggregate', label: 'Aggregates count', class: 'text-right', sortable: true },
        { key: 'total', label: 'Total Messages', class: 'text-right', sortable: true, sortDirection: 'desc' }
      ],
      filterDebounceTimer: null,
      is_loading: false,
    }
  },
  computed: {
    items() {
      // Transform addresses_stats and ensure total property for sorting
      return Object.entries(this.addresses_stats).map(([address, stats]) => ({
        address,
        ...stats,
        total: stats.messages || 0  // Add total field which represents total messages
      }));
    },
    ...mapState({
      account: 'account',
      api_server: 'api_server',
      profiles: 'profiles',
      addresses_stats: 'addresses_stats',
      addresses_pagination: 'addresses_pagination'
    }),
    total() {
      return this.addresses_pagination?.total
    }
  },

  props: {
    msg_type: {
      type: String
    }
  },
  components: {
    AddressLink
  },
  methods: {
    async loadAddresses() {
      this.is_loading = true
      try {
        await this.$store.dispatch("load_addresses", {
          page: this.page,
          perPage: this.per_page,
          sortBy: this.sortBy,
          sortOrder: this.sortDesc ? -1 : 1,
          addressContains: this.filter
        })
      } finally {
        this.is_loading = false
      }
    },

    onFilterUpdate() {
      // Use search from API instead of client-side filtering
      if (this.filterDebounceTimer) {
        clearTimeout(this.filterDebounceTimer);
      }

      this.filterDebounceTimer = setTimeout(() => {
        // Reset to first page when filtering
        this.page = 1;
        this.loadAddresses();
      }, 500);
    },

    changePage(newPage) {
      this.page = newPage;
      this.loadAddresses();
    },

    clearFilter() {
      this.filter = '';
      this.page = 1;
      this.loadAddresses();
    }
  },
  watch: {
    page(newPage, oldPage) {
      if (newPage !== oldPage) {
        this.loadAddresses();
      }
    },
    filter() {
      this.onFilterUpdate();
    }
  },
  mounted() {
    // Set initial pagination values
    this.page = this.addresses_pagination.page || 1;
    this.per_page = this.addresses_pagination.per_page || 20;

    // Seed the search box from ?q=… so links from SearchBar land pre-filtered.
    if (this.$route.query.q) {
      this.filter = this.$route.query.q;
    }

    // Always load first page data to ensure it's fresh
    this.loadAddresses();
  },
  beforeDestroy() {
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
    }
  }
}
</script>

<style scoped>
/* Match the Home dashboard table style. ::v-deep is needed because
   b-table renders thead/tbody internally, outside the scoped attr. */
::v-deep .addresses-table thead th {
  padding: 0.55rem 1.25rem !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #000 !important;
  text-transform: none !important;
  background: transparent !important;
  border-bottom: 1px solid #dee2e6 !important;
}

::v-deep .addresses-table tbody td {
  height: auto !important;
  padding: 0.5rem 1.25rem !important;
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

::v-deep .addresses-table tbody tr:last-child td {
  border-bottom: none;
}

.is-loading-data {
  opacity: 0.2;
  pointer-events: none;
  transition: opacity 0.2s;
}

.addresses-search {
  flex: 1 1 auto;
  max-width: 480px;
  min-width: 240px;
}
</style>
