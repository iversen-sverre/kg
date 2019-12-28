function mediaqueryload(ev) {
	var mediaqueryobjects = document.querySelectorAll('.mediaquery'),
	page = document.querySelector(".page"),
	all = mediaqueryobjects.length, i = all, current = null, attr = null,
	sDelete = "link" /* "link bla1 bla2" */ , bDelete=true;
	page.classList.add('hidden');
	while (i--) {
		current = mediaqueryobjects[i];
		if (current.dataset.media) {
			bDelete = (sDelete.indexOf((current.tagName).toLowerCase())>-1);
			if (window.matchMedia(current.dataset.media).matches) {
				if (bDelete) current.classList.remove("mediaquery");
				for (attr in current.dataset) {
					if (attr !== 'media' || bDelete) {
						current.setAttribute(attr, current.dataset[attr]);
						current.removeAttribute("data-"+attr);
					}
					if (!bDelete) current.classList.remove('hidden');
				}
			} else if (!bDelete) current.classList.add('hidden');
		}
	}
	page.classList.remove('hidden');
}

//mediaqueryload();
window.addEventListener('resize', mediaqueryload, false);