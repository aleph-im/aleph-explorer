import axios from 'axios'

export const toUnixTimestamp = d => d ? new Date(d).getTime() / 1000 : undefined


/**
 * Map frontend column names to API expected values
 */
export const sortByMapping = {
  'messages': 'messages',
  'posts': 'POST',
  'aggregates': 'AGGREGATE',
  'store': 'STORE',
  'program': 'PROGRAM',
  'instance': 'INSTANCE',
  'forget': 'FORGET'
}

/**
 * Fetch addresses with pagination, sorting and filtering
 * Only uses v1 API endpoint
 * 
 * @param {Object} api_server The API server configuration
 * @param {Object} options Query parameters
 * @returns {Promise<Object>} The API response
 */
export const fetchAddresses = async (api_server, options = {}) => {
  const {
    page = 1,
    perPage = 20,
    sortBy = 'messages',
    sortOrder = -1,
    addressContains = ''
  } = options;

  // Convert frontend column names to API expected values
  const apiSortBy = sortByMapping[sortBy] || 'messages';

  try {
    const response = await axios.get(
      `${api_server.protocol}//${api_server.host}/api/v1/addresses/stats.json`,
      {
        params: {
          pagination: perPage,
          page,
          sortBy: apiSortBy,
          sortOrder,
          ...(addressContains ? { addressContains } : {})
        }
      }
    );
    
    // Process the data - convert API data format to frontend format
    const addressList = response.data.data.map(item => {
      return {
        address: item.address,
        messages: item.messages || 0,
        posts: item.post || 0,
        aggregates: item.aggregate || 0,
        store: item.store || 0,
        program: item.program || 0,
        instance: item.instance || 0,
        forget: item.forget || 0
      };
    });

    // Also prepare the traditional object format for compatibility
    const addressesObject = {};
    addressList.forEach(item => {
      addressesObject[item.address] = item;
    });

    return {
      addresses: addressList,
      addressesObject,
      pagination: {
        page: response.data.pagination_page,
        per_page: response.data.pagination_per_page,
        total: response.data.pagination_total
      }
    };
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    if (error.response?.data) {
      console.error('API error details:', error.response.data);
    }
    throw error;
  }
}
