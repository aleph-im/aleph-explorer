<template>
  <div>
    <b-card no-body class="card-primary">
      <b-card-header class="d-flex justify-content-between">
        <h4>Addresses</h4>

        <b-form-group label-cols-sm="3" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Search by address"></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="clearFilter" class="clear-button">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-card-header>

      <!-- Table implementation for addresses -->
      <b-table responsive table-class="compact" :items="items" :fields="addresses_fields" stacked="sm"
        :sort-by.sync="sortBy" :sort-desc.sync="sortDesc">
        <template v-slot:cell(address)="data">
          <AddressLink :address="data.value" class="address" />
        </template>
      </b-table>

      <b-card-footer class="d-flex justify-content-between align-items-center bg-whitesmoke">
        <span>Total: {{ total }}</span>
        <b-pagination v-model="page" :total-rows="total" :per-page="per_page" limit="9" class="mb-0"
          size="sm" @change="changePage">
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
      sortBy: 'messages',
      sortDesc: true,
      sortDirection: 'desc',
      addresses_fields: [
        { key: 'address', label: 'Address', sortable: false },
        { key: 'posts', label: 'Posts count', class: 'text-right', sortable: false },
        { key: 'aggregates', label: 'Aggregates count', class: 'text-right', sortable: false },
        { key: 'messages', label: 'Total Messages', class: 'text-right', sortable: false, sortDirection: 'desc' }
      ],
      filterDebounceTimer: null,
    }
  },
  computed: {
    items() {
      // Force to be an array
      return Object.values(this.addresses_stats);
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
    loadAddresses() {
        this.$store.dispatch("load_addresses", {
          page: this.page,
          perPage: this.per_page,
          sortBy: this.sortBy,
          sortOrder: this.sortDesc ? -1 : 1,
          addressContains: this.filter
        })


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
    sortBy() {
      this.loadAddresses();
    },
    sortDesc() {
      this.loadAddresses();
    },
    filter() {
      this.onFilterUpdate();
    }
  },
  mounted() {
    // Set initial pagination values
    this.page = this.addresses_pagination.page || 1;
    this.per_page = this.addresses_pagination.per_page || 20;

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
