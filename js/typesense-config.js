/**
 * cloudStr — Typesense client config
 * Leave host/searchKey empty to keep using the built-in local search.
 * searchKey must be a SEARCH-ONLY key (never the admin key).
 */
window.CLOUDSTR_TYPESENSE = {
  host: "",
  protocol: "https",
  port: 443,
  searchKey: "",
  collection: "products"
};
