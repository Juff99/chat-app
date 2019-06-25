var linkify = require('linkifyjs');//Procura hyperlinks na string
var linkifyStr = require('linkifyjs/string');//Converte o hyperlink para html tags
const metaScraper = require('meta-scraper').default; //Para fazer Web Scraping, procurar opengraph e meta tags

async function findHypertext(texto){
    var embed = [];
    var emb = {type: '',title: '',image: '',video: '',description:'', color:'#272727', url:''};
    var msgTexto = '';
    var urlresult = linkify.find(texto);

    msgTexto = linkifyStr(texto,{/*...*/});

    if (urlresult.length == 0) {
        return {error:'hyperlink nao encontrado', urlListLen:urlresult.length, msgTexto:msgTexto};
    }else{
        for (let i=0;i<urlresult.length;i++) {
            if ((urlresult[i].href.match(/\.(jpeg|jpg|gif|png)$/))!= null) {
                emb = {type: 'image', imageHtml:'<img src="'+urlresult[i].href+'">', url: urlresult[i].href};
            }else{
                emb = await metaScraper(urlresult[i].href)
                .then((data) => {
                    if (data.error == true) {
                        var em = {};
                        em.type = urlresult[i].type;
                        em.url = urlresult[i].href;
                        return em;
                    }else{
                        var em = {};
                        em.url = urlresult[i].href;

                        if (data.hasOwnProperty('title')) {
                            em.title = data.title;
                        }
                        if (data.hasOwnProperty('pageTitle')) {
                            em.title = data.pageTitle;
                        }
                        for (let j=0;j<data.allTags.length;j++) {
            
                            if(data.allTags[j].name == "title"){
                                em.title = data.allTags[j].content;
                            }
                            if(data.allTags[j].name == "description"){
                                em.description = data.allTags[j].content;
                            }
                            if(data.allTags[j].name == "theme-color"){
                                em.color = data.allTags[j].content;
                            }
                            if(data.allTags[j].property == "og:video:url"){
                                em.type = 'video';
                                em.video = data.allTags[j].content;
                            }
                            if(data.allTags[j].property == "og:image"){
                                em.image = data.allTags[j].content;
                            }
                        }
                        return em;
                    }
                });
            }
            embed.push(emb);
        }
    }
    return {error:false,msgTexto:msgTexto,embeds:embed};
}

findHypertext("https://pbs.twimg.com/profile_images/1118993797394911233/qycXt8LJ_400x400.jpg")
    .then((embed) => {
        console.log(embed);
    });
/*{ error: true,
  errorMessage: 'Did not receive a valid response. Please check URL and try again.' }
{ error: false,
  msgTexto: '<a href="https://f.vimeocdn.com/images_v6/logo.png" class="linkified" target="_blank">https://f.vimeocdn.com/images_v6/logo.png</a>',  embeds: [] }*/