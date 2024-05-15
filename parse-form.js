require('formidable');

const parseForm = (req, res, next) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
        if(err) {
            next(err);
            return;
        }
        req.fields = fields;
        req.files = files;
        next();
    });
};

exports.parseForm = parseForm;