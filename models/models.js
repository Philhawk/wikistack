var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack', {
  logging: false
});
var utils = require('../utils/utils.js')


var Page = db.define('page', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  title: {
    type: Sequelize.STRING,
    allowNull: false
  },

  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },

  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING)
  },

  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },

  status: {
    type: Sequelize.ENUM('open', 'closed')
  },

  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  hooks: {
    beforeValidate: function(page, options) {
      page.urlTitle = utils.makeTitleUrl(page.title)
    }
  }
},
{
  getterMethods: {
    fullRouteUrl: function(){
      return `/wiki/${this.urlTitle}`;
    }
  }
});

var User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: Sequelize.STRING,
    allowNull: false
  },

  email: {
    type: Sequelize.STRING,
    isEmail: true,
    allowNull: false
  }
})

module.exports = {
  Page: Page,
  User: User
}

Page.belongsTo(User, {as: 'author'})
