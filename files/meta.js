(function() {
	var Realmac = Realmac || {};

	Realmac.meta = {
		
		// Set the browser title
		//
		// @var String text
		setTitle: function(text) {
			return document.title = text;
		},
		
		// Set the content attribute of a meta tag
		//
		// @var String name
		// @var String content
		setTagContent: function(tag, content){
			// If the tag being set is title
			// return the result of setTitle
			if ( tag === 'title' )
			{
				return this.setTitle(content);
			}
			
			// Otherwise try and find the meta tag
			var tag = this.getTag(tag);
			
			// If we have a tag, set the content
			if ( tag !== false )
			{
				return tag.setAttribute('content', content);
			}
			
			return false;
		},
		
		// Find a meta tag
		//
		// @var String name
		getTag: function(name) {
			var meta = document.querySelectorAll('meta');
			
			for ( var i=0; i<meta.length; i++ )
			{
				if (meta[i].name == name){
					return meta[i];
				}
			}
			
			var tag = document.createElement('meta');
			tag.name = name;
			document.getElementsByTagName('head')[0].appendChild(tag);
			
			return tag;
		}
	};
 
	// Object containing all website meta info
	var websiteMeta = {"1a3ed8b2515f7475465711d3a7140b8b-33.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","4de39587e0b12c9b6f1db2525b48edd5-24.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","category-sbgames.html":"A list of posts in category &ldquo;SBGames&rdquo;","eae70a2d729dcea2b68046b387dbefb7-23.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","6d6b32c78092a7707bbfd089d1666f9e-25.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","a61af30c0f9b15a41a02010ce2e1f882-22.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","category-game-reporter.html":"A list of posts in category &ldquo;Game Reporter&rdquo;","archive-2022.html":"Archives for 2022","archive-2021.html":"Archives for 2021","category-hq-interativa.html":"A list of posts in category &ldquo;HQ Interativa&rdquo;","archive-2020.html":"Archives for 2020","2ad66fed09ea5118f50692e843452580-15.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","eec1695ab4cd86aed11284e1de936f13-14.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","c1a21a5a8b0c03c56787eee0bb00aae9-20.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","7012e218999b9fc5436f7e92878faeaf-26.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","f41a518d458e295ccea7f5f602bd34e0-34.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","d9e1b61ef4d4e01bf168aeb4d5ea4049-19.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","86ffc692302c2744f6dd3a3a5229c497-17.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","d599f5bfe97740201de080425397bdcb-31.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","6468038182ef1142220bd884eaf24e1a-32.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","3be1a125cecaccb51a76954557945530-16.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","category-ler-e-brincar.html":"A list of posts in category &ldquo;LER E BRINCAR&rdquo;","category-linkedin.html":"A list of posts in category &ldquo;LinkedIn&rdquo;","category-funda00e700e3o-casa-dos-sonhos.html":"A list of posts in category &ldquo;Funda&ccedil;&atilde;o Casa dos Sonhos&rdquo;","86881e3c2d39aa789eb991669c13d686-29.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","bb11038fbf8529e7d12c3d44936e0a69-21.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","category-letr00f4nica.html":"A list of posts in category &ldquo;Letr&ocirc;nica&rdquo;","category-medium.html":"A list of posts in category &ldquo;Medium&rdquo;","b6d5878c7275f33183edc9d0a0696c7a-28.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","f2f497eaa140fd57b8090282dc2cfef8-30.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","category-doutorado.html":"A list of posts in category &ldquo;Doutorado&rdquo;","category-revista-mafagafo.html":"A list of posts in category &ldquo;Revista Mafagafo&rdquo;","0076bebc8d25cceccff9fe370a6b8ea7-27.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q","5b28e0061ec5ade803c1833e8d0c5d7e-18.html":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, q"};
 
	// pageId must match the key in websiteMeta object
	var url = window.location.pathname;
	var pageId = url.substring(url.lastIndexOf('/')+1);
	if (!pageId || pageId.length == 0){
		pageId = 'index.html';
	}
	pageMeta = websiteMeta[pageId];
 
	// If we have meta for this page
	if (pageMeta){
		Realmac.meta.setTagContent('description', pageMeta);
	}
 
 })();