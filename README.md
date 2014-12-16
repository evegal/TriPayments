#Gateway

#Global CLI Dependencies
	+ XAMPP    [https://www.apachefriends.org/index.htmlinstall]
	+ NODE     [http://nodejs.org/download/]
	+ BOWER    npm install -g bower
	+ GULP     npm install -g gulp
	+ RUBY     [http://www.rubyinstaller.org/]
	+ COMPASS  gem install compass -v 0.12.7  [STABLE VERISON]


##step 1 : Clone repo
	$ git remote add origin https://github.com/dkontizas/TriPayments.git
##step 2 : Place folder in HTDOCS
	XAMPP/htdocs 
##step 3 : Install Node Dependencies (package.json)
	npm update
##step 4 : Install Bower Dependencies (bower.json)
	bower update
##step 5 : Run Gulp
	gulp
##step 6 : Start XAMPP
	start XAMPP then navigate to localhost/gateway