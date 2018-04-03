import joi from 'joi';

export const schema = joi.object().keys({
  name: joi.string().min(1).required(),
  path: joi.string().min(1).required(),
  type: joi.string().required(),
  servers: joi.object().required().pattern(
    /[/s/S]*/,
    joi.object().keys(),
  ),
  env: joi.object().pattern(/[/s/S]*/, [joi.string(), joi.number(), joi.bool()]).default(),
  docker: joi.object().keys({
    args: joi.array().items(joi.string()),
    networks: joi.array().items(joi.string()),
  }).default(),
});

export default function validate(config, utils) {
  let details = [];

  details = utils.combineErrorDetails(
    details,
    joi.validate(config.app, schema, utils.VALIDATE_OPTIONS),
  );

  details = utils.combineErrorDetails(
    details,
    utils.serversExist(config.servers, config.app.servers),
  );

  return utils.addLocation(details, 'app');
}
