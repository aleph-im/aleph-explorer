<template>
  <div>
    <b-card no-body class="card-primary">
      <b-card-header class="d-flex justify-content-between">
        <h4>Addresses</h4>

        <b-form-group label-cols-sm="3" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" debounce="750" placeholder="Type to Search"></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''" class="clear-button">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-card-header>

      <b-table responsive table-class="compact" :items="items" :fields="addresses_fields" stacked="sm"
        :current-page="page" :per-page="per_page" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
        :sort-direction="sortDirection" @filtered="onFiltered">
        <template v-slot:cell(address)="data">
          <AddressLink :address="data.value" class="address" />
        </template>
      </b-table>

      <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
        Total: {{ total }}
        <b-pagination v-model="page" :total-rows="total" :per-page="per_page" limit="9" class="mb-0"
          size="sm"></b-pagination>
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
      total: 0,
      page: 1,
      filter: '',
      sortBy: 'messages',
      sortDesc: true,
      sortDirection: 'desc',
      addresses_fields: [
        { key: 'address', label: 'Address', sortable: true },
        { key: 'posts', label: 'Posts count', class: 'text-right', sortable: true },
        { key: 'aggregates', label: 'Aggregates count', class: 'text-right', sortable: true },
        { key: 'messages', label: 'Total Messages', class: 'text-right', sortable: true }
      ]
    }
  },
  computed: {
    items() {
      return Object.entries(this.addresses_stats)
        .filter(
          address => (
            !this.filter || address[0].toLowerCase().includes(
              this.filter.toLowerCase()
            )
          )
        )
        .map(([address, stats]) => ({ address, ...stats }))
    },
    ...mapState({
      account: 'account',
      api_server: 'api_server',
      profiles: 'profiles',
      addresses_stats: 'addresses_stats'
    })
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
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.total = filteredItems.length
      this.page = 1
    }
  },
  mounted() {
    // Set the initial number of items
    this.total = this.items.length
  }
}
</script>
