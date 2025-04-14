package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.request.CreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.request.UserFilterRequest;
import vn.thanhdattanphuoc.batdongsan360.domain.request.UserUpdateDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResCreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResUpdateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.UserDTO;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@RestController
public class UserController {

    private UserService userService;
    final private PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/api/admin/users")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@Valid @RequestBody CreateUserDTO createUserDTO)
            throws IdInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(createUserDTO.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + createUserDTO.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        String hashPassword = this.passwordEncoder.encode(createUserDTO.getPassword());
        createUserDTO.setPassword(hashPassword);
        User newUser = this.userService.handleCreateUser(createUserDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ResCreateUserDTO(newUser));
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable("id") long id) throws IdInvalidException {

        if (this.userService.fetchUserById(id) == null) {
            throw new IdInvalidException("Id không hợp lệ: không tìm thấy user id " + id + ", ...");
        }

        this.userService.handleDeleteUser(id);

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/api/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") long id) throws IdInvalidException {

        User fetchUser = this.userService.fetchUserById(id);

        if (fetchUser == null)
            throw new IdInvalidException("Id không hợp lệ: không tìm thấy user id " + id + ", ...");

        return ResponseEntity.status(HttpStatus.OK).body(fetchUser);
    }

    @PutMapping("/api/users")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody UserUpdateDTO userUpdateDTO)
            throws IdInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(userUpdateDTO.getEmail());
        User currentUser = this.userService.fetchUserById(userUpdateDTO.getId());
        if (isEmailExist && !currentUser.getEmail().equals(userUpdateDTO.getEmail())) {
            throw new IdInvalidException(
                    "Email " + userUpdateDTO.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        User newUser = this.userService.handleUpdateUser(userUpdateDTO);
        if (newUser == null) {
            throw new IdInvalidException(
                    "User id " + userUpdateDTO.getId() + " không tồn tại.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ResUpdateUserDTO(newUser));
    }

    @GetMapping("/api/admin/users")
    public ResponseEntity<Page<UserDTO>> getUsers(@ModelAttribute UserFilterRequest filter) {
        Page<UserDTO> users = userService.getUsers(filter);
        return ResponseEntity.ok(users);
    }
}
