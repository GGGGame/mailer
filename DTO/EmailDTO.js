import yup from 'yup';

export class EmailDTO {

    constructor(name, email, object, context) {
        this.name = name;
        this.email = email;
        this.object = object;
        this.context = context;
    }

    static validationSchema() {
        return yup.object().shape({
            name: yup.string()
                .matches(/^[A-Za-z\s]+$/, 'Name must not contain numbers')
                .required('Name is required'),
            email: yup.string()
                .email('Invalid email format')
                .required('Email is required'),
            object: yup.string()
                .required('Object is required'),
            context: yup.string()
                .min(10, 'Context must be at least 10 characters')
                .max(500, 'Context must be at most 500 characters')
                .required('Context is required')
        });
    }

    async validate() {
        const schema = EmailDTO.validationSchema();
        await schema.validate(this);
    }
}