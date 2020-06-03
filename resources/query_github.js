async get_data_from_md(url) {
  var pr = new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send(null);
    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      let imgSrc = null;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          const text = xhr.responseText;
          const regexImage = /\((https:[^\) ]+)\)/;
          const regexMattermost = /https:\/\/mattermost.brainhack.org\/brainhack\/channels\/([^"\)]+)/;
          const arrImage = text.match(regexImage);
          const arrMattermost = text.match(regexMattermost);
          let image, mattermost;
          if(arrImage !== null && arrImage[1] !== null) {
            image = arrImage[1];
          }
          if(arrMattermost !== null && arrMattermost[1] !== null) {
            mattermost = arrMattermost[1];
          }
          resolve({image, mattermost});
        } else {
          // console.log('Error: ' + xhr.status); // An error occurred during the request.
          resolve(null);
        }
      }
    }
  });
return pr;
}

async get_data_from_readme(repoURL) {
  const url = repoURL.replace("https://github.com/","https://raw.githubusercontent.com/") + "/master";
  let result;    
  result = await get_data_from_md(url + '/README.md');
  if(result === null) {
    result = await get_data_from_md(url + '/ReadMe.md');
  } else if(result === null) {
    result = await get_data_from_md(url + '/readme.md');
  } else if(result === null) {
    result = await get_data_from_md(url + '/Readme.md');
  }

  return result;
}

async get_repo_list() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/search/repositories?q=topic:brainhack-proceedings fork:true');
  xhr.send(null);
  xhr.onreadystatechange = function () {
    const DONE = 4;
    const OK = 200;
    if (xhr.readyState === DONE) {
      if (xhr.status === OK) {
        const res = JSON.parse(xhr.responseText);
        for(let repo of res.items) {
          ((aRepo) => {
            const {
              name,
              authors,
              html_url,
              language,
            } = aRepo;
            get_data_from_readme(html_url).then((res) => {
              const {image, mattermost} = res;
              app.projects.push({
                imgSrc:(image)?image:defaultImages[parseInt(defaultImages.length*Math.random())],
                projectName: name,
                projectAuthors: authors,
                projectURL: html_url,
                projectInfo: {html_url, language},
              })
            }).catch((e)=>console.log);
          })(repo);
        }
      } else {
        console.log('Error: ' + xhr.status);
      }
    }
  };
}