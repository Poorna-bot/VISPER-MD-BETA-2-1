// If you switch to ES Modules
import fetch from 'node-fetch';
import file_size_url from 'file-size-url';
import * as cheerio from 'cheerio';
import tools from './config.js';

 async function search(args) {
    let res = (await fetch(tools.api(5, '/apps/search', {
      query: args,
      limit: 1000
    })))

    let ress = {}
    res = (await res.json())
    ress = res.datalist.list.map(v => {
      return {
        name: v.name,
        id: v.package
      }
    })
    return ress
  }
async function download(id) {
    let res = (await fetch(tools.api(5, '/apps/search', {
      query: id,
      limit: 1
    })))

    res = (await res.json())
let name = res.datalist.list[0].name
let package = res.datalist.list[0].package
let icon = res.datalist.list[0].icon
let dllink = res.datalist.list[0].file.path
let lastup = res.datalist.list[0].updated
let size = await file_size_url(dllink)
return{
  name,
  lastup,
  package,
  size,
  icon,
  dllink
}
}

export = { search, download }
