import ProjectFacebook from "../src"

(async () => {
  const project = await ProjectFacebook()
  project.posting("Another post after few weeks", (err, res) => {
    if (err) {
      console.error(err)
    } else {
      console.log(res)
    }
  })
})()
