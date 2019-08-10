if (logicContext.getVerb() == "INSERT")
    return new Date();
else
    return row.inserted_date;
