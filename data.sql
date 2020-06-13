-- \c
-- jobly

DROP TABLE IF EXISTS companies;

CREATE TABLE companies
(
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

-- INSERT INTO companies
--     (handle,name,num_employees,description,logo_url)
-- VALUES
    -- ("google", "Google", 119000, "Google it", "https://cdn.vox-cdn.com/thumbor/Pkmq1nm3skO0-j693JTMd7RL0Zk=/0x0:2012x1341/1200x800/filters:focal(0x0:2012x1341)/cdn.vox-cdn.com/uploads/chorus_image/image/47070706/google2.0.0.jpg"),
    -- ("apple", "Apple Computer", 137000, "Maker of OSX", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1000px-Apple_logo_black.svg.png"),
    -- ("ibm", "IBM", 350000, "Big blue", "https://1000logos.net/wp-content/uploads/2017/02/IBM-Logo.png"),
    -- ("abnb", "Airbnb", 13000, "Enjoy your stay", "https://banner2.cleanpng.com/20180605/oot/kisspng-airbnb-logo-coupon-privately-held-company-airbnb-logo-5b167f0c6a7270.541603821528200972436.jpg");