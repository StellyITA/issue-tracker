'use strict';
const mongoose = require('mongoose');

module.exports = function (app,Issue) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let queryKeys = Object.keys(req.query);
      let queryEntries = Object.entries(req.query);
      Issue.find({ project_name: project }).then((arr) => {
        if (req.query && queryKeys.length === 0 && Object.getPrototypeOf(req.query) === Object.prototype) {
          return res.json(arr);
        };
        let arrArr = [];
        let subArr = [];
        let stringArr = [];
        let queryStrings = [];
        for (let i in arr) {
          arrArr.push(Object.entries(Object.entries(arr[i])[2][1]));
        }
        for (let j in arrArr) {
          for (let k in arrArr[j]) {
            subArr.push(arrArr[j][k].toString());
          }
          stringArr.push(subArr);
          subArr = [];
        }
        let filtered;
        for (let l in queryEntries) {
          queryStrings.push(queryEntries[l].toString());
          filtered = arr.filter((e,i) => {
            if (stringArr[i].indexOf(queryStrings[l]) >= 0) {
              return e;
            };
          })
        }
        return res.send(filtered);
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let title = req.body.issue_title;
      let text = req.body.issue_text;
      let creator = req.body.created_by;
      if (!title || !text || !creator) {
        return res.json({ error: "required field(s) missing" })
      };
      let newIssue = new Issue({
        project_name: project,
        issue_title: title,
        issue_text: text,
        created_by: creator,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: new Date().toLocaleString(),
        updated_on: new Date().toLocaleString(),
        open: true
      }).save()
      .then(() => {
        Issue.findOne({
          project_name: project,
          issue_title: title,
          issue_text: text,
          created_by: creator
          }).then((foundIssue) => {
            res.json({
              _id: foundIssue._id,
              issue_title: foundIssue.issue_title,
              issue_text: foundIssue.issue_text,
              created_by: foundIssue.created_by,
              assigned_to: foundIssue.assigned_to,
              status_text: foundIssue.status_text,
              created_on: foundIssue.created_on,
              updated_on: foundIssue.updated_on,
              open: foundIssue.open
            });
          })
      }).catch(err => console.log(err))
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let bodyArr = Object.values(req.body).filter(e => e !== "");
      if (req.body._id !== "" && bodyArr.length > 1) {
        Issue.findById(req.body._id).then((issue) => {
          for (let key in req.body) {
            if (req.body[key] !== "" && key !== "_id") {
              issue[key] = req.body[key];
            }
          }
          issue.updated_on = new Date().toLocaleString();
          issue.save();
          return res.json({ result: "successfully updated", _id: req.body._id });
        }).catch(err => {
          return res.json({ error: "could not update", _id: req.body._id});
        });
      } else if (req.body._id !== "" && bodyArr.length === 1) {
        return res.json({ error: "no update field(s) sent", _id: req.body._id })
      } else {
        return res.json({ error: "missing _id" })
      };
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      Issue.deleteOne({ _id: req.body._id }).then((obj) => {
        if (obj.deletedCount === 1) {
          return res.json({ result: "successfully deleted", _id: req.body._id })
        }
      }).catch((err) => {
        if (err.value === "") {
          return res.json({ error: "missing _id" });
        } else {
          return res.json({ error: "could not delete", _id: req.query._id })
        }
      })
    });
    
};