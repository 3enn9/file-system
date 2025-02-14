
const currentPath = window.location.pathname;
console.log(currentPath);
document.addEventListener("DOMContentLoaded", function() {

  const rows = document.querySelectorAll(".table-row");
  const sortAscButton = document.querySelector(".sort-asc");
  const sortDescButton = document.querySelector(".sort-desc");
  const BackButton = document.querySelector(".back");

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString);
  
  rootPath = urlParams.get("root")

  if (rootPath == null || rootPath == "") {
    rootPath = ".";
  }
  rows.forEach(function(row) {

    row.addEventListener("click", function(event) {
      const nameValue = row.children[1].innerText
      const redirectUrl = currentPath + "?root=" + rootPath + "/" + nameValue
      window.location.href = redirectUrl
    });
  });

  sortAscButton.addEventListener("click", function(event){
    event.preventDefault();
    handleSort("asc")
  })

  sortDescButton.addEventListener("click", function(event){
    event.preventDefault();
    handleSort("desc")
  })

  BackButton.addEventListener("click", function(event){
    event.preventDefault();
    const url = new URL(window.location.href)
    let root = url.searchParams.get("root")

    if (root && root.length !== 1){
      const pathSegment = root.split("/").filter(segmet => segmet);
      pathSegment.pop();

      root = pathSegment.join("/");
      url.searchParams.set("root", root);

      window.location.href = url.toString();
    }
  })

  function handleSort(order) {
    const url = new URL(window.location.href);
    const encodedOrder = order.replace("/", "_");
    url.searchParams.set("sort", encodedOrder);
    window.location.href = url.toString()
  }
});