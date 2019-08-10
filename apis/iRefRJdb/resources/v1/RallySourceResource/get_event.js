var ttl = "RallySourceResource Get Event - "; 

// TODO remove virtuals.assigned_to = "Joe";

log.debug(ttl + "tableRow (straight from database, no parents): " + tableRow.toString());
log.debug(ttl + "row      (aliased attributes, only resource defined attributes): " + row.toString());
log.debug(ttl + "logicRow (tableRow with parents, NPAs): " + logicRow.toString());
log.debug(ttl + "virtuals (initially empty, use to set values for virtual attributes): " + virtuals.toString());

// simulate filtering stories only for given Feature.
// can't do in resourceFilter, since no filtering on parent (join) attrs, so do it here.
// FIXME lookups are disabled, pending investigation

if (logicRow.Feature !== null) {
    if (logicRow.Feature.category_ident == 1)   // FIXME - very inefficient / unfriendly parent filtering
        row = null;
    
    if (virtuals.category_ident == 1) {  // FIXME - this didn't work... parents fetched *after* events??  (doc'd??)
        row = null;
    }
}
