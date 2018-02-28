// Copyright (c) 2018, Awab Abdoun and Mohammed Elamged and contributors
// For license information, please see license.txt

frappe.ui.form.on('Material Request', {
	setup: function(frm) {
		frm.custom_make_buttons = {
			'Stock Entry': 'Issue Material',
			'Production Order': 'Production Order'
		}
	},
	onload: function(frm) {
		// add item, if previous view was item
		rms.utils.add_item(frm);

		//set schedule_date
		set_schedule_date(frm);

		// formatter for material request item
		frm.set_indicator_formatter('item_code',
			function(doc) { return (doc.qty<=doc.ordered_qty) ? "green" : "orange" })
	}
});

frappe.ui.form.on("Material Request Item", {
	qty: function (frm, doctype, name) {
		var d = locals[doctype][name];
		if (flt(d.qty) < flt(d.min_order_qty)) {
			frappe.msgprint(__("Warning: Material Requested Qty is less than Minimum Order Qty"));
		}
	},

	item_code: function(frm, doctype, name) {
		set_schedule_date(frm);
	},

	schedule_date: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		if (row.schedule_date) {
			if(!frm.doc.schedule_date) {
				rms.utils.copy_value_in_all_row(frm.doc, cdt, cdn, "items", "schedule_date");
			} else {
				set_schedule_date(frm);
			}
		}
	}
});

// rms.utilities.TransactionBase = rms.utilities.TransactionBase.extend({
// 	onload: function(doc) {
// 		this._super();
// 		this.frm.set_query("item_code", "items", function() {
// 			return {
// 				query: "rms.controllers.queries.item_query"
// 			}
// 		});
// 	},

// 	refresh: function(doc) {
// 		var me = this;
// 		this._super();

// 		if(doc.docstatus==0) {
// 			cur_frm.add_custom_button(__("Get Items from BOM"),
// 				cur_frm.cscript.get_items_from_bom, "fa fa-sitemap", "btn-default");
// 		}

// 		if(doc.docstatus == 1 && doc.status != 'Stopped') {
// 			if(flt(doc.per_ordered, 2) < 100) {
// 				// make
// 				if(doc.material_request_type === "Material Transfer")
// 					cur_frm.add_custom_button(__("Transfer Material"),
// 					this.make_stock_entry, __("Make"));

// 				if(doc.material_request_type === "Material Issue")
// 					cur_frm.add_custom_button(__("Issue Material"),
// 					this.make_stock_entry, __("Make"));

// 				if(doc.material_request_type === "Manufacture")
// 					cur_frm.add_custom_button(__("Production Order"),
// 					function() { me.raise_production_orders() }, __("Make"));

// 				cur_frm.page.set_inner_btn_group_as_primary(__("Make"));

// 				// stop
// 				cur_frm.add_custom_button(__('Stop'),
// 					cur_frm.cscript['Stop Material Request']);

// 			}
// 		}

// 		if(doc.docstatus == 1 && doc.status == 'Stopped')
// 			cur_frm.add_custom_button(__('Re-open'),
// 				cur_frm.cscript['Unstop Material Request']);

// 	},

// 	get_items_from_bom: function() {
// 		var d = new frappe.ui.Dialog({
// 			title: __("Get Items from BOM"),
// 			fields: [
// 				{"fieldname":"bom", "fieldtype":"Link", "label":__("BOM"),
// 					options:"BOM", reqd: 1, get_query: function(){
// 						return {filters: { docstatus:1 }}
// 					}},
// 				{"fieldname":"warehouse", "fieldtype":"Link", "label":__("Warehouse"),
// 					options:"Warehouse", reqd: 1},
// 				{"fieldname":"fetch_exploded", "fieldtype":"Check",
// 					"label":__("Fetch exploded BOM (including sub-assemblies)"), "default":1},
// 				{fieldname:"fetch", "label":__("Get Items from BOM"), "fieldtype":"Button"}
// 			]
// 		});
// 		d.get_input("fetch").on("click", function() {
// 			var values = d.get_values();
// 			if(!values) return;
// 			values["company"] = cur_frm.doc.company;
// 			frappe.call({
// 				method: "rms.manufacturing.doctype.bom.bom.get_bom_items",
// 				args: values,
// 				callback: function(r) {
// 					if(!r.message) {
// 						frappe.throw(__("BOM does not contain any stock item"))
// 					} else {
// 						rms.utils.remove_empty_first_row(cur_frm, "items");
// 						$.each(r.message, function(i, item) {
// 							var d = frappe.model.add_child(cur_frm.doc, "Material Request Item", "items");
// 							d.item_code = item.item_code;
// 							d.item_name = item.item_name;
// 							d.description = item.description;
// 							d.warehouse = values.warehouse;
// 							d.uom = item.stock_uom;
// 							d.qty = item.qty;
// 						});
// 					}
// 					d.hide();
// 					refresh_field("items");
// 				}
// 			});
// 		});
// 		d.show();
// 	},

// 	tc_name: function() {
// 		this.get_terms();
// 	},

// 	make_stock_entry: function() {
// 		frappe.model.open_mapped_doc({
// 			method: "rms.stock.doctype.material_request.material_request.make_stock_entry",
// 			frm: cur_frm
// 		});
// 	},

// 	raise_production_orders: function() {
// 		var me = this;
// 		frappe.call({
// 			method:"rms.stock.doctype.material_request.material_request.raise_production_orders",
// 			args: {
// 				"material_request": me.frm.doc.name
// 			},
// 			callback: function(r) {
// 				if(r.message.length) {
// 					me.frm.reload_doc();
// 				}
// 			}
// 		});
// 	},

// 	validate: function() {
// 		set_schedule_date(this.frm);
// 	},

// 	items_add: function(doc, cdt, cdn) {
// 		var row = frappe.get_doc(cdt, cdn);
// 		if(doc.schedule_date) {
// 			row.schedule_date = doc.schedule_date;
// 			refresh_field("schedule_date", cdn, "items");
// 		} else {
// 			this.frm.script_manager.copy_from_first_row("items", row, ["schedule_date"]);
// 		}
// 	},

// 	items_on_form_rendered: function() {
// 		set_schedule_date(this.frm);
// 	},

// 	schedule_date: function() {
// 		set_schedule_date(this.frm);
// 	}
// });

cur_frm.cscript['Stop Material Request'] = function() {
	var doc = cur_frm.doc;
	$c('runserverobj', args={'method':'update_status', 'arg': 'Stopped', 'docs': doc}, function(r,rt) {
		cur_frm.refresh();
	});
};

cur_frm.cscript['Unstop Material Request'] = function(){
	var doc = cur_frm.doc;
	$c('runserverobj', args={'method':'update_status', 'arg': 'Submitted','docs': doc}, function(r,rt) {
		cur_frm.refresh();
	});
};

function set_schedule_date(frm) {
	if(frm.doc.schedule_date){
		rms.utils.copy_value_in_all_row(frm.doc, frm.doc.doctype, frm.doc.name, "items", "schedule_date");
	}
}
